ALTER TABLE "image_scraper_jobs" DROP CONSTRAINT "image_scraper_jobs_job_id_scrap_images_id_fk";
--> statement-breakpoint
ALTER TABLE "image_scraper_jobs" ADD COLUMN "JobId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "image_scraper_jobs" DROP COLUMN "job_id";--> statement-breakpoint
ALTER TABLE "image_scraper_jobs" ADD CONSTRAINT "image_scraper_jobs_JobId_unique" UNIQUE("JobId");