import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  sql?: postgres.Sql;
};

const fallbackDatabaseUrl = "postgresql://postgres:postgres@localhost:5432/cozin";

function getDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    return fallbackDatabaseUrl;
  }

  try {
    return new URL(process.env.DATABASE_URL).toString();
  } catch {
    return fallbackDatabaseUrl;
  }
}

const databaseUrl = getDatabaseUrl();

const sql =
  globalForDb.sql ??
  postgres(databaseUrl, {
    max: 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}

export const db = drizzle(sql, { schema });
