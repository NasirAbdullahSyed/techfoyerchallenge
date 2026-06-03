import {
  pgTable,
  integer,
  varchar,
  boolean,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { countries } from "./country.schema.js";

// ─── State Table ─────────────────────────────────────────────────────

export const states = pgTable(
  "states",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    code: varchar("code", { length: 10 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    countryId: integer("country_id")
      .notNull()
      .references(() => countries.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_states_country_id").on(table.countryId),
    unique("states_code_country_id_unique").on(table.code, table.countryId),
  ]
);

// ─── State Relations ─────────────────────────────────────────────────

export const statesRelations = relations(states, ({ one }) => ({
  country: one(countries, {
    fields: [states.countryId],
    references: [countries.id],
  }),
}));

// ─── Inferred Types ──────────────────────────────────────────────────

export type StateSelect = typeof states.$inferSelect;
export type StateInsert = typeof states.$inferInsert;
