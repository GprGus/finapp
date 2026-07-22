ALTER TABLE "entries" ADD COLUMN "subscription_id" uuid;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "account_id" uuid;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "interval_days" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "last_charge_date" date;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "is_recurring" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "end_date" date;--> statement-breakpoint
UPDATE "subscriptions" s SET "account_id" = (SELECT a.id FROM "accounts" a WHERE a.user_id = s.user_id ORDER BY a.created_at LIMIT 1) WHERE s."account_id" IS NULL;--> statement-breakpoint
DELETE FROM "subscriptions" WHERE "account_id" IS NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "account_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscriptions_account_id_idx" ON "subscriptions" USING btree ("account_id");