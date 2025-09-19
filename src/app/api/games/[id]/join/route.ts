import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { games, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import Database from 'better-sqlite3'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Find the game
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, id))
      .limit(1)

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    if (game.status !== "waiting") {
      return NextResponse.json({ error: "Game is not available to join" }, { status: 400 })
    }

    if (game.whitePlayerId === session.user.id) {
      return NextResponse.json({ error: "Cannot join your own game" }, { status: 400 })
    }

    if (game.blackPlayerId) {
      return NextResponse.json({ error: "Game is already full" }, { status: 400 })
    }

    // Join the game using raw SQL
    const sqlite = new Database('chess.db');
    const stmt = sqlite.prepare(`
      UPDATE games 
      SET blackPlayerId = ?, status = 'in_progress', updatedAt = ? 
      WHERE id = ?
    `)
    
    stmt.run(session.user.id, Date.now(), id)
    sqlite.close()
    
    // Fetch the updated game
    const [updatedGame] = await db
      .select()
      .from(games)
      .where(eq(games.id, id))
      .limit(1)

    // Get player info
    const [whitePlayer] = await db
      .select({
        id: users.id,
        name: users.name,
        rating: users.rating,
      })
      .from(users)
      .where(eq(users.id, updatedGame.whitePlayerId!))

    const [blackPlayer] = await db
      .select({
        id: users.id,
        name: users.name,
        rating: users.rating,
      })
      .from(users)
      .where(eq(users.id, session.user.id))

    const gameWithPlayers = {
      ...updatedGame,
      whitePlayer,
      blackPlayer,
    }

    return NextResponse.json({ game: gameWithPlayers })
  } catch (error) {
    console.error("Error joining game:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
