CREATE TABLE "game_maps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "map_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "game_maps_name_unique" ON "game_maps" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "game_maps_slug_unique" ON "game_maps" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_map_id_game_maps_id_fk" FOREIGN KEY ("map_id") REFERENCES "public"."game_maps"("id") ON DELETE restrict ON UPDATE no action;