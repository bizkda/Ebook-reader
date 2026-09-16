// src-tauri/src/commands/bookmark.rs
use crate::db::DbState;
use crate::models::bookmark::{Bookmark, NewBookmark};
use rusqlite::params;
use tauri::State;
use uuid::Uuid;


#[tauri::command]
pub fn add_bookmark(state: State<DbState>, new: NewBookmark) -> Result<Bookmark, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();
    let id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO bookmarks (id, book_id, page, cfi, label, note, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)",
        params![id, new.book_id, new.page, new.cfi, new.label, new.note, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(Bookmark {
        id,
        book_id: new.book_id,
        page: new.page,
        cfi: new.cfi,
        label: new.label,
        note: new.note,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn list_bookmarks(state: State<DbState>, book_id: String) -> Result<Vec<Bookmark>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, book_id, page, cfi, label, note, created_at, updated_at
             FROM bookmarks WHERE book_id = ?1 ORDER BY created_at ASC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![book_id], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                book_id: row.get(1)?,
                page: row.get(2)?,
                cfi: row.get(3)?,
                label: row.get(4)?,
                note: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_bookmark(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM bookmarks WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn update_bookmark_note(
    state: State<DbState>,
    id: String,
    note: Option<String>,
) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE bookmarks SET note = ?1, updated_at = ?2 WHERE id = ?3",
        params![note, now, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}