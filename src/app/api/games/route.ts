import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { games, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import Database from 'better-sqlite3'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allGames = await db
      .select({
        id: games.id,
        whitePlayerId: games.whitePlayerId,
        blackPlayerId: games.blackPlayerId,
        status: games.status,
        currentFen: games.currentFen,
        timeControl: games.timeControl,
        createdAt: games.createdAt,
        whitePlayer: {
          id: users.id,
          name: users.name,
          rating: users.rating,
        },
      })
      .from(games)
      .leftJoin(users, eq(games.whitePlayerId, users.id))
      .orderBy(games.createdAt)

    // Get black player info separately due to join limitations
    const gamesWithPlayers = await Promise.all(
      allGames.map(async (game) => {
        let blackPlayer = null
        if (game.blackPlayerId) {
          const [black] = await db
            .select({
              id: users.id,
              name: users.name,
              rating: users.rating,
            })
            .from(users)
            .where(eq(users.id, game.blackPlayerId))
          blackPlayer = black
        }

        return {
          ...game,
          blackPlayer,
        }
      })
    )

    return NextResponse.json({ games: gamesWithPlayers })
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { timeControl } = await request.json()

    if (!timeControl) {
      return NextResponse.json({ error: "Time control is required" }, { status: 400 })
    }

    // Create game with raw SQL to avoid timestamp issues
    const gameId = crypto.randomUUID()
    const currentTime = Date.now()
    
    const sqlite = new Database('chess.db');
    const stmt = sqlite.prepare(`
      INSERT INTO games (id, whitePlayerId, timeControl, status, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(gameId, session.user.id, timeControl, "waiting", currentTime, currentTime)
    sqlite.close()
    
    // Fetch the created game using Drizzle
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1)

    // Get the game with player info
    const [whitePlayer] = await db
      .select({
        id: users.id,
        name: users.name,
        rating: users.rating,
      })
      .from(users)
      .where(eq(users.id, session.user.id))

    const gameWithPlayer = {
      ...game,
      whitePlayer,
      blackPlayer: null,
    }

    return NextResponse.json({ game: gameWithPlayer })
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
