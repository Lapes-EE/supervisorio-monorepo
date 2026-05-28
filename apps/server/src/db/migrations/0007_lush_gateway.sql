CREATE TYPE "public"."health" AS ENUM('healthy', 'failing', 'cooldown');--> statement-breakpoint
ALTER TABLE "meters" ADD COLUMN "enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "meters" ADD COLUMN "health" "health" DEFAULT 'healthy';--> statement-breakpoint
ALTER TABLE "meters" ADD COLUMN "failure_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "meters" ADD COLUMN "last_failed_at" timestamp with time zone;--> statement-breakpoint
UPDATE "meters" SET "enabled" = "active";
