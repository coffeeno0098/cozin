import { describe, expect, it, vi } from "vitest";

import { applyVerifiedTopup } from "@/lib/topup";

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
  constructor(private readonly writes: Array<Record<string, unknown>>) {}

  async values(values: Record<string, unknown>) {
    this.writes.push(values);
  }
}

function createTopupDb(selectResults: SelectResult[]) {
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
    insert: vi.fn(() => new InsertQuery(insertWrites)),
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

describe("applyVerifiedTopup", () => {
  it("locks the user and grants one point per baht inside the transaction", async () => {
    const rawResponse = { statusCode: 200, payload: { status: { code: "SUCCESS" } } };
    const harness = createTopupDb([[{ id: "user-1", points: 25 }]]);

    await expect(
      applyVerifiedTopup("user-1", "payment-1", 30, rawResponse, harness.database as never),
    ).resolves.toEqual({
      balanceAfter: 55,
      pointsGranted: 30,
    });

    expect(harness.selectQueries[0].locks).toEqual([{ mode: "update", options: undefined }]);
    expect(harness.updateWrites).toEqual([
      expect.objectContaining({ points: 55 }),
      expect.objectContaining({
        amountBaht: 30,
        pointsGranted: 30,
        rawResponse,
        status: "verified",
      }),
    ]);
    expect(harness.insertWrites).toEqual([
      expect.objectContaining({
        userId: "user-1",
        type: "topup",
        points: 30,
        balanceAfter: 55,
        paymentId: "payment-1",
      }),
    ]);
  });

  it("throws before writing when the user is missing", async () => {
    const harness = createTopupDb([[]]);

    await expect(
      applyVerifiedTopup("missing-user", "payment-1", 30, {}, harness.database as never),
    ).rejects.toThrow("User not found");
    expect(harness.updateWrites).toHaveLength(0);
    expect(harness.insertWrites).toHaveLength(0);
  });

  it("rejects invalid amounts before opening a transaction", async () => {
    const harness = createTopupDb([[{ id: "user-1", points: 25 }]]);

    await expect(
      applyVerifiedTopup("user-1", "payment-1", 0, {}, harness.database as never),
    ).rejects.toThrow("Top-up amount must be a positive integer");
    expect(harness.database.transaction).not.toHaveBeenCalled();
  });
});
