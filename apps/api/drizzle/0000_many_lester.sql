CREATE TABLE "countries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "countries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "countries_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "states_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"country_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "states_code_country_id_unique" UNIQUE("code","country_id")
);
--> statement-breakpoint
ALTER TABLE "states" ADD CONSTRAINT "states_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_states_country_id" ON "states" USING btree ("country_id");