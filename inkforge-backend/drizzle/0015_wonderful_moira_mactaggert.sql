CREATE TABLE "scrape_image_downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_id" uuid NOT NULL,
	"ip" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scrape_image_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_id" uuid NOT NULL,
	"ip" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scrape_image_downloads" ADD CONSTRAINT "scrape_image_downloads_image_id_scrap_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."scrap_images"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scrape_image_views" ADD CONSTRAINT "scrape_image_views_image_id_scrap_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."scrap_images"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "scrape_image_downloads_unique" ON "scrape_image_downloads" USING btree ("image_id","ip");--> statement-breakpoint
CREATE UNIQUE INDEX "scrape_image_views_unique" ON "scrape_image_views" USING btree ("image_id","ip");