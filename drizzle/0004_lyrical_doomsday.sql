CREATE TABLE "site_announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "site_announcements" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "site_announcements" ADD CONSTRAINT "site_announcements_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "site_announcements_active_created_idx" ON "site_announcements" USING btree ("is_active","created_at");--> statement-breakpoint
CREATE INDEX "site_announcements_created_by_user_idx" ON "site_announcements" USING btree ("created_by_user_id");
