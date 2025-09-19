import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('chess.db');
export const db = drizzle(sqlite, { schema });

// Initialize database with tables
export function initializeDb() {
  // Create tables if they don't exist
  sqlite.exec(`
    PRAGMA foreign_keys = ON;
    
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      emailVerified INTEGER,
      image TEXT,
      rating INTEGER DEFAULT 1200,
      createdAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS accounts (
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

    CREATE TABLE IF NOT EXISTS sessions (
      sessionToken TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verificationTokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires INTEGER NOT NULL,
      PRIMARY KEY (identifier, token)
    );

    CREATE TABLE IF NOT EXISTS authenticators (
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

    CREATE TABLE IF NOT EXISTS games (
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

    CREATE TABLE IF NOT EXISTS moves (
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
}

export default db;
