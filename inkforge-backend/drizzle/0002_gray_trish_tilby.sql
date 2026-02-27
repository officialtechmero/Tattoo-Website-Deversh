CREATE TABLE "credit_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source" "source" NOT NULL,
	"source_id" uuid,
	"delta" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"cycle_total" integer DEFAULT 0 NOT NULL,
	"cycle_used" integer DEFAULT 0 NOT NULL,
	"cycle_resets_at" timestamp,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "design_favorites" (
	"user_id" uuid NOT NULL,
	"design_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "design_favorites_user_id_design_id_pk" PRIMARY KEY("user_id","design_id")
);
--> statement-breakpoint
CREATE TABLE "designs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"image_url" text NOT NULL,
	"thumb_url" text,
	"style" varchar(60) NOT NULL,
	"placement" varchar(60),
	"category" varchar(60),
	"design_type" varchar(60),
	"city" varchar(100),
	"artist_name" varchar(120),
	"display_name" varchar(160),
	"gender_tag" varchar(30),
	"body_part_tag" text,
	"theme_tag" varchar(50),
	"symbol_tag" varchar(50),
	"floral_tag" varchar(50),
	"animal_tag" varchar(50),
	"celestial_tag" varchar(50),
	"unique_tag" varchar(50),
	"session_cost" integer,
	"session_estimate" integer,
	"tip_cents" integer,
	"visibility" "visibility" DEFAULT 'public',
	"like_count" integer DEFAULT 0 NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"prompt" text NOT NULL,
	"style" varchar(60) NOT NULL,
	"placement" varchar(60),
	"complexity" smallint NOT NULL,
	"color_mode" "color_mode" NOT NULL,
	"line_weight" "line_weight" NOT NULL,
	"status" "generation_job_status" DEFAULT 'queued' NOT NULL,
	"result_design_id" uuid,
	"error_message" text,
	"credits_spent" integer DEFAULT 1 NOT NULL,
	"is_variation" boolean DEFAULT false,
	"parent_job_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "complexity_range" CHECK ("generation_jobs"."complexity" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE TABLE "payment_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"subscription_id" uuid,
	"provider" "provider" NOT NULL,
	"provider_order_id" varchar(120),
	"provider_payment_id" varchar(120),
	"amount_cents" integer NOT NULL,
	"currency" char(3) DEFAULT 'USD' NOT NULL,
	"status" "status_payment_order" NOT NULL,
	"description" varchar(255),
	"paid_at" timestamp,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" "code" DEFAULT 'free',
	"name" varchar(60) NOT NULL,
	"monthly_price" integer NOT NULL,
	"yearly_price" integer NOT NULL,
	"currency" char(3) DEFAULT 'USD' NOT NULL,
	"monthly_credits" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"features" jsonb NOT NULL,
	"unavailable_features" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" "subscription_status" NOT NULL,
	"billing_interval" "billing_interval" NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false,
	"cancelled_at" timestamp,
	"provider" "provider",
	"provider_subs_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" uuid NOT NULL,
	"full_name" varchar(120) DEFAULT 'Guest',
	"country" varchar(100),
	"city" varchar(100),
	"persona" "persona" DEFAULT 'exploring',
	"experience_level" "experience_level" DEFAULT 'beginner',
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"password" text NOT NULL,
	"status" "user_status" DEFAULT 'active',
	"email_verified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_wallets" ADD CONSTRAINT "credit_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_favorites" ADD CONSTRAINT "design_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_favorites" ADD CONSTRAINT "design_favorites_design_id_designs_id_fk" FOREIGN KEY ("design_id") REFERENCES "public"."designs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "designs" ADD CONSTRAINT "designs_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_result_design_id_designs_id_fk" FOREIGN KEY ("result_design_id") REFERENCES "public"."designs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_parent_job_id_generation_jobs_id_fk" FOREIGN KEY ("parent_job_id") REFERENCES "public"."generation_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_created_at_index" ON "credit_ledger" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "unique_style_created_at_index" ON "designs" USING btree ("style","created_at");--> statement-breakpoint
CREATE INDEX "unique_like_count_index" ON "designs" USING btree ("like_count");--> statement-breakpoint
CREATE INDEX "unique_created_at_index" ON "designs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "unique_filter_tag_index" ON "designs" USING btree ("body_part_tag","theme_tag","symbol_tag","floral_tag","animal_tag","celestial_tag","unique_tag");--> statement-breakpoint
CREATE INDEX "unique_user_id_created_at_index" ON "generation_jobs" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "unique_status_index" ON "generation_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "unique_user_id_created_at_payment_index" ON "payment_orders" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_status_index" ON "subscriptions" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_email_index" ON "users" USING btree ("email");