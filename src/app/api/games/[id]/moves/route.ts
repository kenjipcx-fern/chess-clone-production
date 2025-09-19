import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { moves, games } from "@/db/schema"
import { eq, asc } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify user is part of this game
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, id))
      .limit(1)

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    const isPlayer = game.whitePlayerId === session.user.id || game.blackPlayerId === session.user.id
    if (!isPlayer) {
      return NextResponse.json({ error: "Not authorized to view this game" }, { status: 403 })
    }

    // Get all moves for this game
    const gameMoves = await db
      .select()
      .from(moves)
      .where(eq(moves.gameId, id))
      .orderBy(moves.moveNumber)

    return NextResponse.json({ moves: gameMoves })
  } catch (error) {
    console.error("Error fetching moves:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
