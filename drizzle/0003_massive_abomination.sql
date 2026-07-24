ALTER TABLE "debts" ADD COLUMN "cadence" text DEFAULT 'interval' NOT NULL;--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "billing_day" integer;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cadence" text DEFAULT 'interval' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "billing_day" integer;