ALTER TABLE "measures" ALTER COLUMN "time" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "measures" ALTER COLUMN "time" SET DEFAULT now();