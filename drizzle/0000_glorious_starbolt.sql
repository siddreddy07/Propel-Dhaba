CREATE TABLE "refunds" (
	"ticket_id" varchar(50) PRIMARY KEY NOT NULL,
	"approved" boolean NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"received_at" timestamp with time zone NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"purchases" jsonb NOT NULL,
	"app_opens_since_renewal" integer NOT NULL,
	"category" varchar(50),
	"severity" varchar(20),
	"refund_required" boolean,
	"reply_draft" text,
	"needs_human" boolean,
	"confidence" real,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;