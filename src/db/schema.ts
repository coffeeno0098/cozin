import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);
export const codeStatusEnum = pgEnum("code_status", ["available", "reserved", "sold"]);
export const orderStatusEnum = pgEnum("order_status", ["paid", "fulfilled", "cancelled", "refunded"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "verified", "rejected"]);
export const pointTransactionTypeEnum = pgEnum("point_transaction_type", [
  "topup",
  "purchase",
  "refund",
  "adjustment",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull(),
    name: text("name"),
    email: text("email"),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").default("customer").notNull(),
    points: integer("points").default(0).notNull(),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("users_points_non_negative", sql`${table.points} >= 0`),
    uniqueIndex("users_username_unique").on(table.username),
    uniqueIndex("users_email_unique").on(table.email),
  ],
);

export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminUserId: uuid("admin_user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: uuid("target_id"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("admin_audit_logs_admin_user_idx").on(table.adminUserId),
    index("admin_audit_logs_action_idx").on(table.action),
    index("admin_audit_logs_created_at_idx").on(table.createdAt),
  ],
);

export const siteAnnouncements = pgTable(
  "site_announcements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    message: text("message").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("site_announcements_active_created_idx").on(table.isActive, table.createdAt),
    index("site_announcements_created_by_user_idx").on(table.createdByUserId),
  ],
);

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.identifier, table.token],
    }),
  ],
);

export const authenticators = pgTable(
  "authenticators",
  {
    credentialID: text("credential_id").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: text("transports"),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.credentialID],
    }),
  ],
);

export const gameMaps = pgTable(
  "game_maps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("game_maps_name_unique").on(table.name),
    uniqueIndex("game_maps_slug_unique").on(table.slug),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    mapId: uuid("map_id").references(() => gameMaps.id, { onDelete: "restrict" }),
    gameMap: text("game_map").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    pricePoints: integer("price_points").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("products_slug_unique").on(table.slug),
    index("products_active_idx").on(table.isActive),
  ],
);

export const gameCodes = pgTable(
  "game_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    gameAccountId: text("game_account_id").notNull(),
    gamePassword: text("game_password").notNull(),
    status: codeStatusEnum("status").default("available").notNull(),
    soldToUserId: uuid("sold_to_user_id").references(() => users.id, { onDelete: "set null" }),
    soldAt: timestamp("sold_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("game_codes_product_status_idx").on(table.productId, table.status),
    index("game_codes_sold_to_user_idx").on(table.soldToUserId),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    truemoneyVoucherUrl: text("truemoney_voucher_url").notNull(),
    externalReference: text("external_reference"),
    amountBaht: integer("amount_baht").notNull(),
    pointsGranted: integer("points_granted").notNull(),
    status: paymentStatusEnum("status").default("pending").notNull(),
    rawResponse: jsonb("raw_response"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
  },
  (table) => [
    index("payments_user_idx").on(table.userId),
    uniqueIndex("payments_external_reference_unique").on(table.externalReference),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    gameCodeId: uuid("game_code_id")
      .notNull()
      .references(() => gameCodes.id, { onDelete: "restrict" }),
    pricePoints: integer("price_points").notNull(),
    status: orderStatusEnum("status").default("fulfilled").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("orders_user_idx").on(table.userId),
    uniqueIndex("orders_game_code_unique").on(table.gameCodeId),
  ],
);

export const pointTransactions = pgTable(
  "point_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: pointTransactionTypeEnum("type").notNull(),
    points: integer("points").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "set null" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("point_transactions_points_non_zero", sql`${table.points} <> 0`),
    check("point_transactions_balance_after_non_negative", sql`${table.balanceAfter} >= 0`),
    index("point_transactions_user_idx").on(table.userId),
    index("point_transactions_payment_idx").on(table.paymentId),
    index("point_transactions_order_idx").on(table.orderId),
  ],
);
