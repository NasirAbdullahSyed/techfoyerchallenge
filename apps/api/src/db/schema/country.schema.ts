import {
  pgTable,
  integer,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { states } from "./state.schema.js";

// ─── Country Table ───────────────────────────────────────────────────

export const countries = pgTable("countries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── Country Relations ───────────────────────────────────────────────

export const countriesRelations = relations(countries, ({ many }) => ({
  states: many(states),
}));

// ─── Inferred Types ──────────────────────────────────────────────────

export type CountrySelect = typeof countries.$inferSelect;
export type CountryInsert = typeof countries.$inferInsert;
