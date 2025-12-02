ALTER TABLE "meters" RENAME COLUMN "isso_id" TO "isso_serial";--> statement-breakpoint
ALTER TABLE "meters" DROP CONSTRAINT "meters_isso_id_unique";--> statement-breakpoint
ALTER TABLE "meters" ADD CONSTRAINT "meters_isso_serial_unique" UNIQUE("isso_serial");