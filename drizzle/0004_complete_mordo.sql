CREATE TABLE "agenda_event_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"from_user_id" uuid NOT NULL,
	"to_user_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agenda_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"date" date NOT NULL,
	"time" text,
	"shared_from_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friend_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"addressee_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agenda_event_shares" ADD CONSTRAINT "agenda_event_shares_event_id_agenda_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."agenda_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agenda_event_shares" ADD CONSTRAINT "agenda_event_shares_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agenda_event_shares" ADD CONSTRAINT "agenda_event_shares_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agenda_events" ADD CONSTRAINT "agenda_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agenda_events" ADD CONSTRAINT "agenda_events_shared_from_user_id_users_id_fk" FOREIGN KEY ("shared_from_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_addressee_id_users_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agenda_event_shares_to_user_id_idx" ON "agenda_event_shares" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "agenda_event_shares_event_id_idx" ON "agenda_event_shares" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "agenda_events_user_id_idx" ON "agenda_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "agenda_events_date_idx" ON "agenda_events" USING btree ("date");--> statement-breakpoint
CREATE INDEX "friend_requests_requester_id_idx" ON "friend_requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "friend_requests_addressee_id_idx" ON "friend_requests" USING btree ("addressee_id");