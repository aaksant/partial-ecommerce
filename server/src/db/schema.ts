import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
  varchar,
  numeric
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("user_role", ["buyer", "seller"]);
export const messageStatusEnum = pgEnum("message_status", [
  "sent",
  "delivered",
  "read"
]);
export const attachmentTypeEnum = pgEnum("attachment_type", [
  "image",
  "document",
  "other"
]);

// Better Auth Tables
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  role: roleEnum("role").default("buyer")
});

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const accounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull()
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verifications = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull()
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const products = pgTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sellerId: text("seller_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const conversations = pgTable("conversations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  buyerId: text("buyer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sellerId: text("seller_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, {
    onDelete: "set null"
  }),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull()
});

export const messages = pgTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content"),
  status: messageStatusEnum("status").default("sent").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull()
});

export const attachments = pgTable("attachments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  messageId: text("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: attachmentTypeEnum("type").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: varchar("size", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow()
});

export const readReceipts = pgTable("read_receipts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lastReadMessageId: text("last_read_message_id").references(
    () => messages.id,
    { onDelete: "set null" }
  ),
  readAt: timestamp("read_at").defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  sentMessages: many(messages),
  buyerConversations: many(conversations, { relationName: "buyer" }),
  sellerConversations: many(conversations, { relationName: "seller" }),
  readReceipts: many(readReceipts),
  products: many(products)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id]
  }),
  conversations: many(conversations)
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    buyer: one(users, {
      fields: [conversations.buyerId],
      references: [users.id],
      relationName: "buyer"
    }),
    seller: one(users, {
      fields: [conversations.sellerId],
      references: [users.id],
      relationName: "seller"
    }),
    messages: many(messages),
    readReceipts: many(readReceipts),
    product: one(products, {
      fields: [conversations.productId],
      references: [products.id]
    })
  })
);

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  }),
  attachments: many(attachments)
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  message: one(messages, {
    fields: [attachments.messageId],
    references: [messages.id]
  })
}));

export const readReceiptsRelations = relations(readReceipts, ({ one }) => ({
  conversation: one(conversations, {
    fields: [readReceipts.conversationId],
    references: [conversations.id]
  }),
  user: one(users, {
    fields: [readReceipts.userId],
    references: [users.id]
  }),
  lastReadMessage: one(messages, {
    fields: [readReceipts.lastReadMessageId],
    references: [messages.id]
  })
}));
