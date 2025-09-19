import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { games, moves, users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { Chess } from "chess.js"

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
    const { from, to, promotion } = await request.json()

    // Find the game
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, id))
      .limit(1)

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    if (game.status !== "in_progress") {
      return NextResponse.json({ error: "Game is not in progress" }, { status: 400 })
    }

    // Check if it's the player's turn
    const chess = new Chess(game.currentFen)
    const currentTurn = chess.turn() // 'w' or 'b'
    const isWhitePlayer = game.whitePlayerId === session.user.id
    const isBlackPlayer = game.blackPlayerId === session.user.id

    if (!isWhitePlayer && !isBlackPlayer) {
      return NextResponse.json({ error: "You are not a player in this game" }, { status: 403 })
    }

    if ((currentTurn === 'w' && !isWhitePlayer) || (currentTurn === 'b' && !isBlackPlayer)) {
      return NextResponse.json({ error: "It's not your turn" }, { status: 400 })
    }

    // Make the move
    try {
      const move = chess.move({ from, to, promotion })
      
      if (!move) {
        return NextResponse.json({ error: "Invalid move" }, { status: 400 })
      }

      // Get move count
      const moveCount = await db
        .select()
        .from(moves)
        .where(eq(moves.gameId, id))

      // Save the move
      const moveData = {
        id: crypto.randomUUID(),
        gameId: id,
        moveNumber: moveCount.length + 1,
        from,
        to,
        promotion: promotion || null,
        san: move.san,
        fen: chess.fen(),
        timestamp: new Date(),
      }
      
      console.log("Inserting move:", moveData)
      await db.insert(moves).values(moveData)

      // Check for game end
      let newStatus = "in_progress"
      let result = null

      if (chess.isGameOver()) {
        if (chess.isCheckmate()) {
          newStatus = "completed"
          result = chess.turn() === 'w' ? 'black' : 'white' // Winner is opposite of current turn
        } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
          newStatus = "draw"
          result = "draw"
        }
      }

      // Update the game
      const updateData = {
        currentFen: chess.fen(),
        status: newStatus,
        result,
        updatedAt: new Date(),
      }
      
      console.log("Updating game:", updateData)
      const [updatedGame] = await db
        .update(games)
        .set(updateData)
        .where(eq(games.id, id))
        .returning()

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
        .where(eq(users.id, updatedGame.blackPlayerId!))

      const gameWithPlayers = {
        ...updatedGame,
        whitePlayer,
        blackPlayer,
      }

      return NextResponse.json({ game: gameWithPlayers, move: move.san })
    } catch (moveError) {
      console.error("Error making move:", moveError)
      return NextResponse.json({ error: "Invalid move" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing move:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
