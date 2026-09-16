// src-tauri/src/commands/progress.rs
use crate::db::DbState;
use crate::models::progress::{ReadingProgress, UpdateProgress};
use rusqlite::{params, OptionalExtension};
use tauri::State;

#[tauri::command]
pub fn upsert_progress(state: State<DbState>, update: UpdateProgress) -> Result<ReadingProgress, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO reading_progress (book_id, current_page, current_cfi, percentage, last_read_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?5)
         ON CONFLICT(book_id) DO UPDATE SET
            current_page = ?2,
            current_cfi = ?3,
            percentage = ?4,
            last_read_at = ?5,
            updated_at = ?5",
        params![update.book_id, update.current_page, update.current_cfi, update.percentage, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(ReadingProgress {
        book_id: update.book_id,
        current_page: update.current_page,
        current_cfi: update.current_cfi,
        percentage: update.percentage,
        last_read_at: Some(now.clone()),
        updated_at: now,
    })
}

#[tauri::command]
pub fn get_progress(state: State<DbState>, book_id: String) -> Result<Option<ReadingProgress>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT book_id, current_page, current_cfi, percentage, last_read_at, updated_at
         FROM reading_progress WHERE book_id = ?1",
        params![book_id],
        |row| {
            Ok(ReadingProgress {
                book_id: row.get(0)?,
                current_page: row.get(1)?,
                current_cfi: row.get(2)?,
                percentage: row.get(3)?,
                last_read_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        },
    )
    .optional()
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_recently_read(state: State<DbState>, limit: i64) -> Result<Vec<ReadingProgress>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT book_id, current_page, current_cfi, percentage, last_read_at, updated_at
             FROM reading_progress
             WHERE last_read_at IS NOT NULL
             ORDER BY last_read_at DESC
             LIMIT ?1",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![limit], |row| {
            Ok(ReadingProgress {
                book_id: row.get(0)?,
                current_page: row.get(1)?,
                current_cfi: row.get(2)?,
                percentage: row.get(3)?,
                last_read_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}