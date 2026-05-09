import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { matches, players } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { winnerId, loserId, winnerGames, loserGames } = await req.json();

  if (winnerGames + loserGames !== 15) {
    return NextResponse.json({ error: "Total games must equal 15" }, { status: 400 });
  }
  if (winnerId === loserId) {
    return NextResponse.json({ error: "Cannot play yourself" }, { status: 400 });
  }

  // Check if they already played
  const existing = await db.select().from(matches).where(
    or(
      and(eq(matches.winnerId, winnerId), eq(matches.loserId, loserId)),
      and(eq(matches.winnerId, loserId), eq(matches.loserId, winnerId))
    )
  );

  if (existing.length > 0) {
    return NextResponse.json({ error: "You have already played this opponent once." }, { status: 400 });
  }

  await db.insert(matches).values({ winnerId, loserId, winnerGames, loserGames });

  // Update stats
  await db.update(players).set({
    points: players.points + 25,
    gamesWon: players.gamesWon + winnerGames,
    gamesLost: players.gamesLost + loserGames,
    matchesPlayed: players.matchesPlayed + 1,
  }).where(eq(players.id, winnerId));

  await db.update(players).set({
    points: players.points - 15,
    gamesWon: players.gamesWon + loserGames,
    gamesLost: players.gamesLost + winnerGames,
    matchesPlayed: players.matchesPlayed + 1,
  }).where(eq(players.id, loserId));

  return NextResponse.json({ success: true });
}