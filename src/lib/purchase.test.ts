import { describe, expect, it, vi } from "vitest";

import { purchaseProduct } from "@/lib/purchase";

type SelectResult = Array<Record<string, unknown>>;

class SelectQuery {
  locks: Array<{ mode: string; options?: unknown }> = [];

  constructor(private readonly result: SelectResult) {}

  from() {
    return this;
  }

  where() {
    return this;
  }

  orderBy() {
    return this;
  }

  for(mode: string, options?: unknown) {
    this.locks.push({ mode, options });
    return this;
  }

  async limit() {
    return this.result;
  }
}

class UpdateQuery {
  constructor(private readonly writes: Array<Record<string, unknown>>) {}

  set(values: Record<string, unknown>) {
    this.writes.push(values);
    return this;
  }

  async where() {
    return undefined;
  }
}

class InsertQuery {
  constructor(
    private readonly writes: Array<Record<string, unknown>>,
    private readonly returningResult?: SelectResult,
  ) {}

  values(values: Record<string, unknown>) {
    this.writes.push(values);
    return this;
  }

  async returning() {
    return this.returningResult ?? [];
  }
}

function createPurchaseDb(selectResults: SelectResult[], insertReturningResults: SelectResult[] = []) {
  const selectQueries: SelectQuery[] = [];
  const updateWrites: Array<Record<string, unknown>> = [];
  const insertWrites: Array<Record<string, unknown>> = [];

  const tx = {
    select: vi.fn(() => {
      const query = new SelectQuery(selectResults.shift() ?? []);
      selectQueries.push(query);
      return query;
    }),
    update: vi.fn(() => new UpdateQuery(updateWrites)),
    insert: vi.fn(() => new InsertQuery(insertWrites, insertReturningResults.shift())),
  };

  return {
    database: {
      transaction: vi.fn(async (callback) => callback(tx)),
    },
    insertWrites,
    selectQueries,
    updateWrites,
  };
}

describe("purchaseProduct", () => {
  it("returns not-found before writing when user or product is missing", async () => {
    const harness = createPurchaseDb([[], []]);

    await expect(purchaseProduct("user-1", "product-1", harness.database as never)).resolves.toEqual({
      ok: false,
      reason: "not-found",
    });
    expect(harness.updateWrites).toHaveLength(0);
    expect(harness.insertWrites).toHaveLength(0);
  });

  it("returns not-enough-points before taking stock", async () => {
    const harness = createPurchaseDb([
      [{ id: "user-1", points: 5 }],
      [{ id: "product-1", pricePoints: 10, isActive: true }],
    ]);

    await expect(purchaseProduct("user-1", "product-1", harness.database as never)).resolves.toEqual({
      ok: false,
      reason: "not-enough-points",
    });
    expect(harness.selectQueries).toHaveLength(2);
    expect(harness.updateWrites).toHaveLength(0);
    expect(harness.insertWrites).toHaveLength(0);
  });

  it("locks the user and available stock row before fulfilling a purchase", async () => {
    const harness = createPurchaseDb(
      [
        [{ id: "user-1", points: 50 }],
        [{ id: "product-1", pricePoints: 10, isActive: true }],
        [{ id: "code-1" }],
      ],
      [[{ id: "order-1" }]],
    );

    await expect(purchaseProduct("user-1", "product-1", harness.database as never)).resolves.toEqual({
      ok: true,
      orderId: "order-1",
    });
    expect(harness.selectQueries[0].locks).toEqual([{ mode: "update", options: undefined }]);
    expect(harness.selectQueries[2].locks).toEqual([{ mode: "update", options: { skipLocked: true } }]);
    expect(harness.updateWrites).toEqual([
      expect.objectContaining({ points: 40 }),
      expect.objectContaining({ status: "sold", soldToUserId: "user-1" }),
    ]);
    expect(harness.insertWrites).toEqual([
      expect.objectContaining({
        userId: "user-1",
        productId: "product-1",
        gameCodeId: "code-1",
        pricePoints: 10,
        status: "fulfilled",
      }),
      expect.objectContaining({
        userId: "user-1",
        type: "purchase",
        points: -10,
        balanceAfter: 40,
        orderId: "order-1",
      }),
    ]);
  });

  it("does not charge the user when no stock is available", async () => {
    const harness = createPurchaseDb([
      [{ id: "user-1", points: 50 }],
      [{ id: "product-1", pricePoints: 10, isActive: true }],
      [],
    ]);

    await expect(purchaseProduct("user-1", "product-1", harness.database as never)).resolves.toEqual({
      ok: false,
      reason: "out-of-stock",
    });
    expect(harness.updateWrites).toHaveLength(0);
    expect(harness.insertWrites).toHaveLength(0);
  });
});
