const Database = require('better-sqlite3');

const db = new Database('./chess.db');

async function testMove() {
  try {
    // Get the current in-progress game
    const games = db.prepare('SELECT * FROM games WHERE status = ? LIMIT 1').all('in_progress');
    const game = games[0];
    
    console.log('Current game:', game);
    
    if (game) {
      // Check if we can insert a move directly
      const moveData = {
        id: crypto.randomUUID(),
        gameId: game.id,
        moveNumber: 1,
        from: 'b2',
        to: 'b3',
        promotion: null,
        san: 'b3',
        fen: 'rnbqkbnr/pppppppp/8/8/8/1P6/P1PPPPPP/RNBQKBNR b KQkq - 0 1',
        timestamp: Date.now(),
      };
      
      console.log('Attempting to insert move:', moveData);
      
      // Try the insert with proper timestamp
      const stmt = db.prepare(`
        INSERT INTO moves (id, gameId, moveNumber, "from", "to", promotion, san, fen, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        moveData.id,
        moveData.gameId,
        moveData.moveNumber,
        moveData.from,
        moveData.to,
        moveData.promotion,
        moveData.san,
        moveData.fen,
        moveData.timestamp
      );
      
      console.log('Move inserted successfully!');
      
      // Update game
      const updateStmt = db.prepare(`
        UPDATE games SET currentFen = ?, updatedAt = ? WHERE id = ?
      `);
      
      updateStmt.run(moveData.fen, Date.now(), game.id);
      
      console.log('Game updated successfully!');
    }
  } catch (error) {
    console.error('Error in test move:', error);
  } finally {
    db.close();
  }
}

testMove();
