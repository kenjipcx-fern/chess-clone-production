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
    console.log('=== MOVE API DEBUG START ===');
    
    // For debugging, let's temporarily skip auth and use hardcoded user ID
    const hardcodedUserId = '1540e21a-cf86-4e18-bce2-6b1a892528b1'; // player2 ID
    console.log('Using hardcoded user ID:', hardcodedUserId);
    
    const { id } = await params
    const body = await request.json()
    const { from, to, promotion } = body
    
    console.log('Move request:', { gameId: id, from, to, promotion });

    // Find the game
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, id))
      .limit(1)

    console.log('Found game:', game);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    if (game.status !== "in_progress") {
      return NextResponse.json({ error: "Game is not in progress" }, { status: 400 })
    }

    // Check if it's the player's turn
    const chess = new Chess(game.currentFen)
    const currentTurn = chess.turn() // 'w' or 'b'
    const isWhitePlayer = game.whitePlayerId === hardcodedUserId
    const isBlackPlayer = game.blackPlayerId === hardcodedUserId

    console.log('Turn info:', { currentTurn, isWhitePlayer, isBlackPlayer });

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

      console.log('Chess move successful:', move);

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
        timestamp: Date.now(),
      }
      
      console.log("Inserting move:", moveData)
      const insertedMove = await db.insert(moves).values(moveData)
      console.log("Move inserted:", insertedMove)

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
        updatedAt: Date.now(),
      }
      
      console.log("Updating game:", updateData)
      const [updatedGame] = await db
        .update(games)
        .set(updateData)
        .where(eq(games.id, id))
        .returning()

      console.log("Game updated:", updatedGame)

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

      console.log('=== MOVE API DEBUG SUCCESS ===');
      return NextResponse.json({ game: gameWithPlayers, move: move.san })
    } catch (moveError) {
      console.error("Error making move:", moveError)
      return NextResponse.json({ error: "Invalid move" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing move:", error)
    console.log('=== MOVE API DEBUG ERROR ===');
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
