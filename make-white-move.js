const Database = require('better-sqlite3');
const { Chess } = require('chess.js');

const db = new Database('./chess.db');

async function makeWhiteMove() {
  // Get current game
  const games = db.prepare('SELECT * FROM games WHERE status = ? LIMIT 1').all('in_progress');
  const game = games[0];
  
  console.log('Current FEN:', game.currentFen);
  
  const chess = new Chess(game.currentFen);
  console.log('Current turn:', chess.turn());
  console.log('Available moves for White:', chess.moves().slice(0, 10)); // Show first 10
  
  // Make a simple pawn move: d2-d4
  const move = chess.move('d4');
  if (move) {
    console.log('Made move:', move.san);
    
    // Get current move count
    const moveCount = db.prepare('SELECT COUNT(*) as count FROM moves WHERE gameId = ?').get(game.id);
    
    // Save move to database
    db.prepare(`
      INSERT INTO moves (id, gameId, moveNumber, "from", "to", promotion, san, fen, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      game.id,
      moveCount.count + 1,
      move.from,
      move.to,
      move.promotion || null,
      move.san,
      chess.fen(),
      Date.now()
    );
    
    // Update game
    db.prepare(`
      UPDATE games SET currentFen = ?, updatedAt = ? WHERE id = ?
    `).run(chess.fen(), Date.now(), game.id);
    
    console.log('Updated FEN:', chess.fen());
    console.log('Next turn:', chess.turn());
    console.log('Move saved successfully!');
  } else {
    console.log('Move d4 failed - trying e4 instead');
    const move2 = chess.move('e4');
    if (move2) {
      console.log('Made move:', move2.san);
      
      const moveCount = db.prepare('SELECT COUNT(*) as count FROM moves WHERE gameId = ?').get(game.id);
      
      db.prepare(`
        INSERT INTO moves (id, gameId, moveNumber, "from", "to", promotion, san, fen, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        crypto.randomUUID(),
        game.id,
        moveCount.count + 1,
        move2.from,
        move2.to,
        move2.promotion || null,
        move2.san,
        chess.fen(),
        Date.now()
      );
      
      db.prepare(`
        UPDATE games SET currentFen = ?, updatedAt = ? WHERE id = ?
      `).run(chess.fen(), Date.now(), game.id);
      
      console.log('Updated FEN:', chess.fen());
      console.log('Next turn:', chess.turn());
      console.log('Move saved successfully!');
    } else {
      console.log('Both d4 and e4 failed');
    }
  }
  
  db.close();
}

makeWhiteMove();
