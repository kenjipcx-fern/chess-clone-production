const Database = require('better-sqlite3');
const { Chess } = require('chess.js');

// Check current game state
const db = new Database('chess.db');

console.log('🎮 CURRENT GAME STATE ANALYSIS 🎮');
console.log('===================================');

// Get current active game
const activeGame = db.prepare("SELECT * FROM games WHERE status = 'in_progress' LIMIT 1").get();

if (!activeGame) {
  console.log('❌ No active games found');
  db.close();
  process.exit(0);
}

console.log('📋 GAME INFO:');
console.log(`   Game ID: ${activeGame.id}`);
console.log(`   White Player ID: ${activeGame.whitePlayerId}`);
console.log(`   Black Player ID: ${activeGame.blackPlayerId}`);
console.log(`   Status: ${activeGame.status}`);
console.log(`   Time Control: ${activeGame.timeControl}`);
console.log(`   Current FEN: ${activeGame.currentFen}`);
console.log('');

// Analyze the chess position
console.log('♟️ CHESS POSITION ANALYSIS:');
try {
  const chess = new Chess(activeGame.currentFen);
  
  console.log(`   Current turn: ${chess.turn() === 'w' ? 'WHITE' : 'BLACK'}`);
  console.log(`   Game status: ${chess.isGameOver() ? 'GAME OVER' : 'ACTIVE'}`);
  
  if (chess.isGameOver()) {
    console.log(`   Checkmate: ${chess.isCheckmate()}`);
    console.log(`   Stalemate: ${chess.isStalemate()}`);
    console.log(`   Draw: ${chess.isDraw()}`);
  }
  
  // Get legal moves
  const moves = chess.moves({ verbose: true });
  console.log(`   Total legal moves: ${moves.length}`);
  
  if (moves.length > 0) {
    console.log('   First 10 legal moves:');
    moves.slice(0, 10).forEach(move => {
      console.log(`     - ${move.from} → ${move.to} (${move.piece === 'p' ? 'pawn' : move.piece})`);
    });
  }
  
  // Check if it's the starting position
  const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  console.log(`   Is starting position: ${activeGame.currentFen === startingFen}`);
  
  console.log('');
  console.log('🔧 DEBUG INFO:');
  console.log(`   White pieces on rank 1: ${chess.board()[7].filter(p => p && p.color === 'w').length}`);
  console.log(`   White pieces on rank 2: ${chess.board()[6].filter(p => p && p.color === 'w').length}`);
  console.log(`   Black pieces on rank 7: ${chess.board()[1].filter(p => p && p.color === 'b').length}`);
  console.log(`   Black pieces on rank 8: ${chess.board()[0].filter(p => p && p.color === 'b').length}`);
  
} catch (error) {
  console.log('❌ ERROR: Invalid FEN position!');
  console.log(`   Error: ${error.message}`);
}

// Show all moves made
console.log('');
console.log('📜 MOVE HISTORY:');
const moves = db.prepare("SELECT * FROM moves WHERE gameId = ? ORDER BY moveNumber").all(activeGame.id);
if (moves.length === 0) {
  console.log('   No moves made yet');
} else {
  moves.forEach(move => {
    console.log(`   ${move.moveNumber}. ${move.from} → ${move.to} (${move.san})`);
  });
}

db.close();
