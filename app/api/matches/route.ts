import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { winnerId, loserId, winnerGames, loserGames } = await req.json();

    if (!winnerId || !loserId || winnerId === loserId) {
      return NextResponse.json({ error: "Invalid players" }, { status: 400 });
    }

    if (winnerGames + loserGames !== 15) {
      return NextResponse.json({ error: "Total games must equal 15" }, { status: 400 });
    }

    // For now we just return success (frontend uses mock data)
    // Real DB insert can be added later
    return NextResponse.json({ 
      success: true,
      message: "Match recorded successfully" 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record match" }, { status: 500 });
  }
}