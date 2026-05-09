import { NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";

export async function GET() {
  try {
    const allPlayers = await db.select().from(players);
    return NextResponse.json(allPlayers);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 200 }); // Return empty array for now
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}