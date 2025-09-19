// Test making a Black move via API to see if the board updates correctly
const fetch = require('node-fetch');

async function testBlackMove() {
  try {
    // Get current game
    const Database = require('better-sqlite3');
    const db = new Database('./chess.db');
    const games = db.prepare('SELECT * FROM games WHERE status = ? LIMIT 1').all('in_progress');
    const game = games[0];
    
    console.log('Current game FEN:', game.currentFen);
    console.log('Current turn (w=white, b=black):', game.currentFen.split(' ')[1]);
    
    // Test a simple black pawn move: e7 to e6
    const moveData = {
      from: 'e7',
      to: 'e6'
    };
    
    console.log('Testing Black move:', moveData);
    
    // Update the API route temporarily to use testuser (Black) ID
    const response = await fetch(`http://localhost:3000/api/games/${game.id}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(moveData)
    });
    
    console.log('Response status:', response.status);
    const data = await response.text();
    console.log('Response body:', data);
    
    db.close();
    
  } catch (error) {
    console.error('Error testing Black move:', error);
  }
}

testBlackMove();
