import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  contactConsent: boolean("contact_consent").default(true),
  points: integer("points").default(1000),
  gamesWon: integer("games_won").default(0),
  gamesLost: integer("games_lost").default(0),
  matchesPlayed: integer("matches_played").default(0),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: text("id").primaryKey(),
  winnerId: text("winner_id").notNull(),
  loserId: text("loser_id").notNull(),
  winnerGames: integer("winner_games").notNull(),
  loserGames: integer("loser_games").notNull(),
  date: timestamp("date").defaultNow(),
});