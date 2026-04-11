import { DatabaseSync } from 'node:sqlite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// In production on Railway, use /data volume for persistence
// In dev, use the project directory
const resolvedPath = process.env.DATABASE_URL || (
  process.env.NODE_ENV === 'production'
    ? '/data/absolved.db'
    : path.join(__dirname, 'absolved.db')
)

// Ensure the directory exists before opening the database
const dbDir = path.dirname(resolvedPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new DatabaseSync(resolvedPath)

// Enable WAL mode and foreign keys
db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_premium INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    atonement_reflection TEXT,
    atonement_action TEXT,
    atonement_affirmation TEXT,
    atonement_status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_sins_user_id ON sins(user_id);
  CREATE INDEX IF NOT EXISTS idx_sins_created_at ON sins(created_at);
`)

// Migrations — safe to run repeatedly
try { db.exec('ALTER TABLE users ADD COLUMN stripe_customer_id TEXT') } catch {}
try { db.exec('ALTER TABLE sins ADD COLUMN completed_at TEXT') } catch {}
try { db.exec('ALTER TABLE sins ADD COLUMN atonement_insight TEXT') } catch {}
try { db.exec('ALTER TABLE sins ADD COLUMN notes TEXT') } catch {}

console.log(`[DB] Connected to SQLite database at ${resolvedPath}`)

export default db
