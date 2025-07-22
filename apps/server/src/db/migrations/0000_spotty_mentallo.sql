CREATE TABLE "meters" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"ip" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "meters_ip_unique" UNIQUE("ip")
);
