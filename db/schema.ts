import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  contactConsent: boolean("contact_consent").default(true),
  points: integer("points").default(0),
  gamesWon: integer("games_won").default(0),
  gamesLost: integer("games_lost").default(0),
  matchesPlayed: integer("matches_played").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  winnerId: integer("winner_id").notNull(),
  loserId: integer("loser_id").notNull(),
  winnerName: text("winner_name").notNull(),
  loserName: text("loser_name").notNull(),
  winnerGames: integer("winner_games").notNull(),
  loserGames: integer("loser_games").notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});