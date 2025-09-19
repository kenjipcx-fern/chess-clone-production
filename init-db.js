const Database = require('better-sqlite3');

const db = new Database('chess.db');

// Initialize database with all necessary tables
db.exec(`
  PRAGMA foreign_keys = ON;
  
  DROP TABLE IF EXISTS authenticators;
  DROP TABLE IF EXISTS moves;
  DROP TABLE IF EXISTS games;
  DROP TABLE IF EXISTS verificationTokens;
  DROP TABLE IF EXISTS sessions;
  DROP TABLE IF EXISTS accounts;
  DROP TABLE IF EXISTS users;
  
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    emailVerified INTEGER,
    image TEXT,
    rating INTEGER DEFAULT 1200,
    createdAt INTEGER
  );

  CREATE TABLE accounts (
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    PRIMARY KEY (provider, providerAccountId)
  );

  CREATE TABLE sessions (
    sessionToken TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires INTEGER NOT NULL
  );

  CREATE TABLE verificationTokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires INTEGER NOT NULL,
    PRIMARY KEY (identifier, token)
  );

  CREATE TABLE authenticators (
    credentialID TEXT NOT NULL UNIQUE,
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    providerAccountId TEXT NOT NULL,
    credentialPublicKey TEXT NOT NULL,
    counter INTEGER NOT NULL,
    credentialDeviceType TEXT NOT NULL,
    credentialBackedUp INTEGER NOT NULL,
    transports TEXT,
    PRIMARY KEY (userId, credentialID)
  );

  CREATE TABLE games (
    id TEXT PRIMARY KEY,
    whitePlayerId TEXT REFERENCES users(id),
    blackPlayerId TEXT REFERENCES users(id),
    status TEXT DEFAULT 'waiting',
    result TEXT,
    currentFen TEXT DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    timeControl TEXT DEFAULT '10+5',
    whiteTimeLeft INTEGER DEFAULT 600000,
    blackTimeLeft INTEGER DEFAULT 600000,
    createdAt INTEGER,
    updatedAt INTEGER
  );

  CREATE TABLE moves (
    id TEXT PRIMARY KEY,
    gameId TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    moveNumber INTEGER NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    promotion TEXT,
    san TEXT NOT NULL,
    fen TEXT NOT NULL,
    timestamp INTEGER
  );
`);

console.log('Database initialized successfully!');
console.log('Tables created:', db.pragma('table_list').map(t => t.name));

db.close();
