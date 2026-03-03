import { sql } from "drizzle-orm";
import { pgTable, pgEnum, uuid, text, timestamp, boolean, jsonb, uniqueIndex, integer, primaryKey, AnyPgColumn, varchar, char, check, smallint, index } from "drizzle-orm/pg-core";

const timestamps = {
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()).defaultNow().notNull()
}

export const scrapeImages = pgTable("scrap_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  query: text("query").notNull(),
  imageLink: text("image_link").unique().notNull(),
  imageAlt: text("image_alt").notNull().default(""),
  ...timestamps
});

export const imageScraperJobsEnum = pgEnum(
  "image_scraper_jobs_status",
  ["completed", "processing", "failed", "cancelled"]
);

export const imageScraperJobs = pgTable("image_scraper_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  JobId: integer().notNull().unique(),
  status: imageScraperJobsEnum().default("processing").notNull(),
  ...timestamps
});

export const statusEnumUsers = pgEnum("user_status", ["active", "suspended", "deleted"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).unique().notNull(),
  password: text("password").notNull(),
  status: statusEnumUsers().default("active"),
  email_verified_at: timestamp("email_verified_at", { withTimezone: true }).defaultNow().notNull(),
  ...timestamps
},
  (table) => ({
    uniqueEmailIndex: uniqueIndex("unique_email_index").on(table.email)
  })
);

export const personaEnumUserProfiles = pgEnum(
  "persona", ["tattoo_enthusiast", "tattoo_artist", "collector", "exploring"]
);
export const experienceLevelUserProfiles = pgEnum(
  "experience_level", ["beginner", "intermediate", "experienced", "pro artist"]
);

export const userProfiles = pgTable("user_profiles", {
  user_id: uuid("user_id").references(() => users.id).notNull(),
  full_name: varchar("full_name", { length: 120 }).default("Guest"),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  persona: personaEnumUserProfiles().default("exploring"),
  experience_level: experienceLevelUserProfiles().default("beginner"),
  avatar_url: text("avatar_url"),
  ...timestamps
});

export const codeEnumPlans = pgEnum("code", ["free", "pro", "artist"]);

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: codeEnumPlans().default("free"),
  name: varchar("name", { length: 60 }).notNull(),
  monthly_price: integer().notNull(),
  yearly_price: integer().notNull(),
  currency: char("currency", { length: 3 }).notNull().default("USD"),
  monthly_credits: integer().notNull(),
  is_active: boolean().default(true),
  features: jsonb("features").notNull(),
  unavailable_features: jsonb("unavailable_features"),
  ...timestamps
});

export const statusEnumSubscriptions = pgEnum("subscription_status",
  ["trialing", "active", "past_due", "cancelled", "expired"]
);
export const billingIntervalEnumSubscriptions = pgEnum("billing_interval", ["monthly", "yearly"]);
export const providerEnumSubscriptions = pgEnum("provider",
  ["stripe", "razorpay", "manual"]
);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  plan_id: uuid("plan_id").references(() => plans.id).notNull(),
  status: statusEnumSubscriptions().notNull(),
  billing_interval: billingIntervalEnumSubscriptions().notNull(),
  current_period_start: timestamp("current_period_start").notNull(),
  current_period_end: timestamp("current_period_end").notNull(),
  cancel_at_period_end: boolean().default(false),
  cancelled_at: timestamp("cancelled_at"),
  provider: providerEnumSubscriptions(),
  provider_subs_id: text("provider_subs_id"),
  ...timestamps
},
  (table) => ({
    userStatusIndex: index("user_status_index").on(
      table.user_id,
      table.status
    )
  })
);

export const creditWallets = pgTable("credit_wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  balance: integer().notNull().default(0),
  cycle_total: integer().notNull().default(0),
  cycle_used: integer().notNull().default(0),
  cycle_resets_at: timestamp("cycle_resets_at"),
  updated_at: timestamps.updated_at
});

export const sourceEnumCreditLedger = pgEnum("source",
  ["generation", "subscription_reset", "purchase", "refund", "admin_adjustment", "variation"]
);

export const creditLedger = pgTable("credit_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  source: sourceEnumCreditLedger().notNull(),
  source_id: uuid("source_id"),
  delta: integer().notNull(),
  balance_after: integer().notNull(),
  note: text("note"),
  created_at: timestamps.created_at
},
  (table) => ({
    userCreatedAtIndex: index("user_created_at_index").on(
      table.user_id,
      table.created_at
    )
  })
);

export const visibilityEnumDesigns = pgEnum("visibility",
  ["public", "private", "unlisted"]
);

export const designs = pgTable("designs", {
  id: uuid("id").defaultRandom().primaryKey(),
  owner_id: uuid("owner_id").references(() => users.id),
  image_url: text("image_url").notNull(),
  thumb_url: text("thumb_url"),
  style: varchar("style", { length: 60 }).notNull(),
  placement: varchar("placement", { length: 60 }),
  category: varchar("category", { length: 60 }),
  design_type: varchar("design_type", { length: 60 }),
  city: varchar("city", { length: 100 }),
  artist_name: varchar("artist_name", { length: 120 }),
  display_name: varchar("display_name", { length: 160 }),
  gender_tag: varchar("gender_tag", { length: 30 }),
  body_part_tag: text("body_part_tag"),
  theme_tag: varchar("theme_tag", { length: 50 }),
  symbol_tag: varchar("symbol_tag", { length: 50 }),
  floral_tag: varchar("floral_tag", { length: 50 }),
  animal_tag: varchar("animal_tag", { length: 50 }),
  celestial_tag: varchar("celestial_tag", { length: 50 }),
  unique_tag: varchar("unique_tag", { length: 50 }),
  session_cost: integer(),
  session_estimate: integer(),
  tip_cents: integer(),
  visibility: visibilityEnumDesigns().default("public"),
  like_count: integer().notNull().default(0),
  download_count: integer().notNull().default(0),
  ...timestamps
},
  (table) => ({
    uniqueStyleCreatedAtIndex: index("unique_style_created_at_index").on(
      table.style,
      table.created_at
    ),
    uniqueLikeCountIndex: index("unique_like_count_index").on(
      table.like_count
    ),
    uniqueCreatedAtIndex: index("unique_created_at_index").on(
      table.created_at
    ),
    uniqueFilterTagsIndex: index("unique_filter_tag_index").on(
      table.body_part_tag,
      table.theme_tag,
      table.symbol_tag,
      table.floral_tag,
      table.animal_tag,
      table.celestial_tag,
      table.unique_tag
    )
  })
);

export const designFavorites = pgTable("design_favorites", {
  user_id: uuid("user_id").references(() => users.id).notNull(),
  design_id: uuid("design_id").references(() => designs.id).notNull(),
  created_at: timestamps.created_at,
},
  (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.design_id] })
  })
);

export const colorModeEnumGenerationJobs = pgEnum("color_mode", ["bw", "color"]);
export const lineWeightGenerationJobs = pgEnum("line_weight",
  ["fine", "medium", "bold"]
)
export const statusGenerationJobs = pgEnum("generation_job_status",
  ["queued", "running", "success", "failed"]
)

export const generationJobs = pgTable("generation_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  prompt: text("prompt").notNull(),
  style: varchar("style", { length: 60 }).notNull(),
  placement: varchar("placement", { length: 60 }),
  complexity: smallint("complexity").notNull(),
  color_mode: colorModeEnumGenerationJobs().notNull(),
  line_weight: lineWeightGenerationJobs().notNull(),
  status: statusGenerationJobs().notNull().default("queued"),
  result_design_id: uuid("result_design_id").references(() => designs.id),
  error_message: text("error_message"),
  credits_spent: integer().notNull().default(1),
  is_variation: boolean().default(false),
  parent_job_id: uuid("parent_job_id").references((): AnyPgColumn => generationJobs.id),
  ...timestamps
},
  (table) => ({
    uniqueUserIdCreatedAtIndex: index("unique_user_id_created_at_index").on(
      table.user_id,
      table.created_at.desc()
    ),
    uniqueStatusIndex: index("unique_status_index").on(
      table.status
    ),
    complexityCheck: check("complexity_range",
      sql`${table.complexity} BETWEEN 1 AND 5`
    )
  })
);

export const statusEnumPaymentOrders = pgEnum("status_payment_order",
  ["pending", "paid", "failed", "refunded"]
);

export const paymentOrders = pgTable("payment_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.id),
  subscription_id: uuid("subscription_id").references(() => subscriptions.id),
  provider: providerEnumSubscriptions().notNull(),
  provider_order_id: varchar("provider_order_id", { length: 120 }),
  provider_payment_id: varchar("provider_payment_id", { length: 120 }),
  amount_cents: integer().notNull(),
  currency: char("currency", { length: 3 }).notNull().default("USD"),
  status: statusEnumPaymentOrders().notNull(),
  description: varchar("description", { length: 255 }),
  paid_at: timestamp("paid_at"),
  created_at: timestamps.created_at.notNull()
},
  (table) => ({
    uniqueUserIdCreatedAtIndex: index("unique_user_id_created_at_payment_index").on(
      table.user_id,
      table.created_at.desc()
    )
  })
);

export const qualityEnumDesignDownloads = pgEnum("quality", 
  ["standard", "hd", "stencil"]
);

export const designDownloads = pgTable("design_downloads", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  design_id: uuid("design_id").references(() => designs.id).notNull(),
  quality: qualityEnumDesignDownloads().notNull(),
  created_at: timestamps.updated_at
});

export const stencilJobs = pgTable("stencil_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").references(() => users.id),
  source_image_url: text("source_image_url").notNull(),
  result_image_url: text("result_image_url"),
  status: statusGenerationJobs().notNull(),
  error_message: text("error_message"),
  created_at: timestamps.created_at,
  completed_at: timestamp("completed_at").defaultNow()
});