CREATE INDEX "scrap_images_created_at_idx" ON "scrap_images" ("created_at" DESC);
--> statement-breakpoint
CREATE INDEX "scrap_images_tags_gin" ON "scrap_images" USING gin ("tags");
