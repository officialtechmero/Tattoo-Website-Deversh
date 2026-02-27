CREATE TYPE "public"."billing_interval" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."code" AS ENUM('free', 'pro', 'artist');--> statement-breakpoint
CREATE TYPE "public"."color_mode" AS ENUM('bw', 'color');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('beginner', 'intermediate', 'experienced', 'pro artist');--> statement-breakpoint
CREATE TYPE "public"."line_weight" AS ENUM('fine', 'medium', 'bold');--> statement-breakpoint
CREATE TYPE "public"."persona" AS ENUM('tattoo_enthusiast', 'tattoo_artist', 'collector', 'exploring');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('stripe', 'razorpay', 'manual');--> statement-breakpoint
CREATE TYPE "public"."source" AS ENUM('generation', 'subscription_reset', 'purchase', 'refund', 'admin_adjustment', 'variation');--> statement-breakpoint
CREATE TYPE "public"."status_payment_order" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."generation_job_status" AS ENUM('queued', 'running', 'success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('public', 'private', 'unlisted');