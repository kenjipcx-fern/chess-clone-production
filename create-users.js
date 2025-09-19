const Database = require('better-sqlite3');

// Create users in the database
const db = new Database('chess.db');

// Create testuser
const testUserId = crypto.randomUUID();
db.prepare(`
  INSERT INTO users (id, email, name, rating, createdAt)
  VALUES (?, ?, ?, ?, ?)
`).run(testUserId, 'testuser@example.com', 'testuser', 1200, Date.now());

// Create player2
const player2Id = crypto.randomUUID();
db.prepare(`
  INSERT INTO users (id, email, name, rating, createdAt)
  VALUES (?, ?, ?, ?, ?)
`).run(player2Id, 'player2@example.com', 'player2', 1200, Date.now());

console.log('Created users:');
console.log('testuser ID:', testUserId);
console.log('player2 ID:', player2Id);

// Show all users
const allUsers = db.prepare('SELECT * FROM users').all();
console.log('All users in database:', allUsers);

db.close();
