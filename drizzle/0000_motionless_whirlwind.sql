CREATE TABLE "matches" (
	"id" text PRIMARY KEY NOT NULL,
	"winner_id" text NOT NULL,
	"loser_id" text NOT NULL,
	"winner_games" integer NOT NULL,
	"loser_games" integer NOT NULL,
	"date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"whatsapp" text,
	"contact_consent" boolean DEFAULT true,
	"points" integer DEFAULT 1000,
	"games_won" integer DEFAULT 0,
	"games_lost" integer DEFAULT 0,
	"matches_played" integer DEFAULT 0,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
