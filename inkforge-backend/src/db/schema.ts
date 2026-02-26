import { pgTable, pgEnum, uuid, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

const timestamps = {
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()).defaultNow().notNull()
}

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  is_active: boolean("is_active").default(true),
  ...timestamps
});

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  monthly: text("monthly").notNull(),
  yearly: text("yearly").notNull(),
  features: jsonb("features").notNull(),
  is_active: boolean("is_active").default(false),
  ...timestamps
});

export const subscriptions = pgTable("subs", {
  id: uuid("id").defaultRandom().notNull(),
  user_id: uuid("user_id").references(() => users.id),
  plan_id: uuid("plan_id").references(() => plans.id),
});

export const sourceTypeEnum = pgEnum("source_type", [
  "generated", "stencil", "curated"
]);

export const statusEnum = pgEnum("status", [
  "ready",
  "failed",
  "processing"
]);

export const designs = pgTable("designs", {
  id: uuid("id").primaryKey(),
  designName: text("designName").notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  source_type: sourceTypeEnum("source_type"),
  status: statusEnum("status"),
  ...timestamps
});

export const favorites = pgTable("favorites", {
  user_id: uuid("user_id").unique().references(() => users.id),
  design_id: uuid("design_id").unique().references(() => designs.id),
  ...timestamps
});

export const downloads = pgTable("downloads", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.id),
  design_id: uuid("design_id").references(() => designs.id),
  format: text("format").notNull(),
  ip: text("ip").notNull(),
  user_agent: jsonb("user_agent").notNull(),
  ...timestamps
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  ...timestamps
});

export const designCategories = pgTable("designCategories", {
  designId: uuid("design_id").references(() => designs.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  ...timestamps
});