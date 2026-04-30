import { db } from "@/db";
import { adminAuditLogs } from "@/db/schema";

type AuditMetadata = Record<string, unknown>;

type WriteAdminAuditLogInput = {
  adminUserId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: AuditMetadata | null;
};

const blockedMetadataKeys = ["password", "secret", "token", "voucher", "rawresponse"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function sanitizeAuditMetadata(metadata: unknown): AuditMetadata | null {
  if (!isRecord(metadata)) {
    return null;
  }

  const safeEntries = Object.entries(metadata)
    .filter(([key]) => {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      return !blockedMetadataKeys.some((blockedKey) => normalizedKey.includes(blockedKey));
    })
    .map(([key, value]) => {
      if (isRecord(value)) {
        return [key, sanitizeAuditMetadata(value)] as const;
      }

      if (Array.isArray(value)) {
        return [key, value.map((item) => (isRecord(item) ? sanitizeAuditMetadata(item) : item))] as const;
      }

      return [key, value] as const;
    });

  return Object.fromEntries(safeEntries);
}

export async function writeAdminAuditLog(input: WriteAdminAuditLogInput) {
  await db.insert(adminAuditLogs).values({
    adminUserId: input.adminUserId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    metadata: sanitizeAuditMetadata(input.metadata),
  });
}
