ALTER TABLE "meters" ADD COLUMN IF NOT EXISTS "isso_serial" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meters" ADD CONSTRAINT "meters_isso_serial_unique" UNIQUE("isso_serial");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
