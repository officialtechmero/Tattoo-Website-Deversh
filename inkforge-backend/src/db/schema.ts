import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const designs = pgTable("designs", {
  id: serial("id").primaryKey(),
  designName: text("designName").notNull(),
  createdBy: integer("createdBy").references(() => users.id)
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull()
});

export const designCategories = pgTable("designCategories", {
  designId: integer("designId").references(() => designs.id).notNull(),
  categoryId: integer("categoryId").references(() => categories.id).notNull(),
});

// Relations

export const designRelations = relations(designs, ({ one }) => ({
  user: one(users, {
    fields: [designs.createdBy],
    references: [users.id]
  })
}));

export const usersRelations = relations(users, ({ many }) => ({
  designs: many(designs)
}));