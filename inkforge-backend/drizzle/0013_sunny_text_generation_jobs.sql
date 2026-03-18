CREATE TYPE "text_generation_jobs_status" AS ENUM ('queued', 'running', 'success', 'failed');
--> statement-breakpoint
CREATE TABLE "text_generation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"JobId" integer NOT NULL,
	"status" "text_generation_jobs_status" DEFAULT 'queued' NOT NULL,
	"total_images" integer NOT NULL,
	"updated" integer DEFAULT 0 NOT NULL,
	"skipped" integer DEFAULT 0 NOT NULL,
	"failed" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "text_generation_jobs_JobId_unique" UNIQUE("JobId")
);
