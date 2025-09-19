const { Chess } = require('chess.js')
const sqlite3 = require('sqlite3')

async function checkCurrentGame() {
  try {
    // Connect to SQLite database
    const db = new sqlite3.Database('./chess.db')
    
    // Get current in-progress game
    const query = "SELECT * FROM games WHERE status = 'in_progress' LIMIT 1"
    const currentGames = await new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
    
    if (currentGames.length === 0) {
      console.log('❌ No active games found')
      db.close()
      return
    }
    
    const game = currentGames[0]
    db.close()
    console.log('🎮 CURRENT GAME STATE:')
    console.log('Game ID:', game.id)
    console.log('White Player ID:', game.whitePlayerId)
    console.log('Black Player ID:', game.blackPlayerId)
    console.log('Status:', game.status)
    console.log('Current FEN:', game.currentFen)
    
    // Test the FEN with chess.js
    console.log('\n♟️ CHESS.JS ANALYSIS:')
    const chess = new Chess(game.currentFen)
    console.log('Current turn:', chess.turn() === 'w' ? 'WHITE' : 'BLACK')
    console.log('Is valid position:', chess.isGameOver() ? 'GAME OVER' : 'ACTIVE')
    
    // Get all possible moves
    const moves = chess.moves({ verbose: true })
    console.log('Total legal moves:', moves.length)
    
    if (moves.length > 0) {
      console.log('First 5 legal moves:')
      moves.slice(0, 5).forEach(move => {
        console.log(`  - ${move.from} → ${move.to} (${move.piece})`)
      })
    } else {
      console.log('❌ NO LEGAL MOVES AVAILABLE')
      console.log('Checkmate:', chess.isCheckmate())
      console.log('Stalemate:', chess.isStalemate()) 
      console.log('Draw:', chess.isDraw())
    }
    
    // Compare with starting position
    console.log('\n📋 POSITION COMPARISON:')
    const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    console.log('Is starting position:', game.currentFen === startingFen)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkCurrentGame()
