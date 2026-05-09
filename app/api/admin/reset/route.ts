import { NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.update(players).set({
    points: 1000,
    gamesWon: 0,
    gamesLost: 0,
    matchesPlayed: 0,
  });

  return NextResponse.json({ success: true });
}