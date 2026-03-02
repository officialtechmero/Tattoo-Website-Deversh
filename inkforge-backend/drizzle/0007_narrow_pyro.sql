ALTER TABLE "scrap_images" RENAME COLUMN "imageLink" TO "image_link";--> statement-breakpoint
ALTER TABLE "scrap_images" RENAME COLUMN "imageAlt" TO "image_alt";--> statement-breakpoint
ALTER TABLE "scrap_images" DROP CONSTRAINT "scrap_images_imageLink_unique";--> statement-breakpoint
ALTER TABLE "scrap_images" ADD CONSTRAINT "scrap_images_image_link_unique" UNIQUE("image_link");