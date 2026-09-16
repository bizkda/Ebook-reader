// src-tauri/src/db.rs
use rusqlite::Connection;
use std::sync::{Arc, Mutex};
use tauri::Manager;

pub struct DbState {
    pub conn: Arc<Mutex<Connection>>,
}

const SCHEMA: &str = "
CREATE TABLE IF NOT EXISTS books (
    id            TEXT PRIMARY KEY,
    title         TEXT NOT NULL,
    author        TEXT,
    file_path     TEXT NOT NULL UNIQUE,
    cover_path    TEXT,
    format        TEXT NOT NULL,
    added_at      TEXT NOT NULL,
    total_pages   INTEGER,
    updated_at    TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS reading_progress (
    book_id        TEXT PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE,
    current_page   INTEGER NOT NULL DEFAULT 0,
    current_cfi    TEXT,
    percentage     REAL NOT NULL DEFAULT 0,
    last_read_at   TEXT,
    updated_at     TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id            TEXT PRIMARY KEY,
    book_id       TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    page          INTEGER,
    cfi           TEXT,
    label         TEXT,
    note          TEXT,
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_books_format ON books(format);
CREATE INDEX IF NOT EXISTS idx_progress_last_read ON reading_progress(last_read_at);
CREATE INDEX IF NOT EXISTS idx_bookmarks_book ON bookmarks(book_id);
";

pub fn init_db(app: &tauri::App) -> DbState {
    let data_dir = app.path().app_data_dir().expect("could not resolve app data dir");
    std::fs::create_dir_all(&data_dir).expect("failed to create app data dir");

    let db_path = data_dir.join("library.db");
    let conn = Connection::open(db_path).expect("failed to open sqlite db");
    conn.execute_batch(SCHEMA).expect("failed to run schema");

    // Migrations for existing databases (safe no-ops if columns already exist)
    let _ = conn.execute("ALTER TABLE books ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''", []);
    let _ = conn.execute("ALTER TABLE reading_progress ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''", []);
    let _ = conn.execute("ALTER TABLE bookmarks ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''", []);

    let now = chrono::Utc::now().to_rfc3339();
    let _ = conn.execute("UPDATE books SET updated_at = ?1 WHERE updated_at = ''", [&now]);
    let _ = conn.execute("UPDATE reading_progress SET updated_at = ?1 WHERE updated_at = ''", [&now]);
    let _ = conn.execute("UPDATE bookmarks SET updated_at = ?1 WHERE updated_at = ''", [&now]);

    DbState {
        conn: Arc::new(Mutex::new(conn)),
    }
}