import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  real,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

import type { Ticket } from "../schemas/triage.schema.js";

// Tickets table
export const tickets = pgTable("tickets", {
  id: varchar("id", { length: 50 }).primaryKey(),

  // Original ticket data
  receivedAt: timestamp("received_at", {
    withTimezone: true,
  }).notNull(),

  subject: text("subject").notNull(),
  body: text("body").notNull(),

  purchases: jsonb("purchases")
    .$type<Ticket["purchases"]>()
    .notNull(),

  appOpensSinceRenewal: integer("app_opens_since_renewal")
    .notNull(),

  // Triage results
  category: varchar("category", { length: 50 }),
  severity: varchar("severity", { length: 20 }),
  replyDraft: text("reply_draft"),
  needsHuman: boolean("needs_human"),
  confidence: real("confidence"),

  status: varchar("status", { length: 20 })
    .notNull()
    .default("pending"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow().notNull(),
});

// Refunds table
export const refunds = pgTable("refunds", {
  ticketId: varchar("ticket_id", { length: 50 })
    .primaryKey()
    .references(() => tickets.id),

  approved: boolean("approved").notNull(),

  amount: integer("amount").notNull(),

  reason: text("reason").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow().notNull(),
});