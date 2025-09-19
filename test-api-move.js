// Test the move API endpoint directly
const fetch = require('node-fetch');

async function testMoveAPI() {
  try {
    // First, let's get the current game ID
    const Database = require('better-sqlite3');
    const db = new Database('./chess.db');
    const games = db.prepare('SELECT * FROM games WHERE status = ? LIMIT 1').all('in_progress');
    const game = games[0];
    db.close();
    
    if (!game) {
      console.error('No in-progress game found');
      return;
    }
    
    console.log('Testing move API for game:', game.id);
    
    // Test the move API
    const moveData = {
      from: 'b7',
      to: 'b6'
    };
    
    const response = await fetch(`http://localhost:3000/api/games/${game.id}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // We need to include auth headers, but for now let's see what happens without them
      },
      body: JSON.stringify(moveData)
    });
    
    console.log('Response status:', response.status);
    const data = await response.text();
    console.log('Response body:', data);
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testMoveAPI();
