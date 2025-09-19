const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const db = new Database('chess.db');

// Create a second test user
const userId = uuidv4();
const stmt = db.prepare(`
  INSERT INTO users (id, name, email, rating, createdAt) 
  VALUES (?, ?, ?, ?, ?)
`);

const result = stmt.run(userId, 'player2', 'player2@example.com', 1200, Date.now());

console.log('Second user created:', result);

// Verify user exists
const user = db.prepare('SELECT * FROM users WHERE email = ?').get('player2@example.com');
console.log('Created user:', user);

db.close();
