CREATE TABLE "scrap_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"imageLink" text NOT NULL,
	"imageAlt" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scrap_images_imageLink_unique" UNIQUE("imageLink")
);
