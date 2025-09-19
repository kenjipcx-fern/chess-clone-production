const Database = require('better-sqlite3');

// Check existing users in the database
const db = new Database('chess.db');

console.log('🎮 CHESS.COM DEMO ACCOUNTS 🎮');
console.log('==============================');

// Show all users
const allUsers = db.prepare('SELECT * FROM users').all();
allUsers.forEach(user => {
  console.log(`👤 Email: ${user.email}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Rating: ${user.rating}`);
  console.log(`   🔑 Password: password123`);
  console.log('');
});

console.log('🎯 TESTING INSTRUCTIONS:');
console.log('1. Open two different browsers (or private/incognito windows)');
console.log('2. Go to: https://chess-app-main-morphvm-52mu6gct.http.cloud.morph.so');
console.log('3. Login with one account in each browser');
console.log('4. Player 1: Create a game');
console.log('5. Player 2: Join the game');
console.log('6. Start playing chess! ♟️');

db.close();
