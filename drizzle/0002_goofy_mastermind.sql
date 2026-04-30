CREATE TABLE "admin_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_audit_logs_admin_user_idx" ON "admin_audit_logs" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_action_idx" ON "admin_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs" USING btree ("created_at");
