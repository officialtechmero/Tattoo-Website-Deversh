CREATE TYPE "public"."quality" AS ENUM('standard', 'hd', 'stencil');--> statement-breakpoint
CREATE TABLE "design_downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"design_id" uuid NOT NULL,
	"quality" "quality" NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stencil_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"source_image_url" text NOT NULL,
	"result_image_url" text,
	"status" "generation_job_status" NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "design_downloads" ADD CONSTRAINT "design_downloads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_downloads" ADD CONSTRAINT "design_downloads_design_id_designs_id_fk" FOREIGN KEY ("design_id") REFERENCES "public"."designs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stencil_jobs" ADD CONSTRAINT "stencil_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;