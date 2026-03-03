CREATE TYPE "public"."image_scraper_jobs_status" AS ENUM('completed', 'processing', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "image_scraper_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"status" "image_scraper_jobs_status" DEFAULT 'processing' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "image_scraper_jobs" ADD CONSTRAINT "image_scraper_jobs_job_id_scrap_images_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."scrap_images"("id") ON DELETE no action ON UPDATE no action;