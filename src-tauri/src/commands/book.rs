// src-tauri/src/commands/book.rs
use crate::db::DbState;
use crate::models::book::{Book, NewBook};
use rusqlite::params;
use tauri::State;
use uuid::Uuid;
use rusqlite::{OptionalExtension};

#[tauri::command]
pub fn add_book(state: State<DbState>, new: NewBook) -> Result<Book, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();
    let id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO books (id, title, author, file_path, cover_path, format, added_at, total_pages, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?7)",
        params![id, new.title, new.author, new.file_path, new.cover_path, new.format, now, new.total_pages],
    )
    .map_err(|e| e.to_string())?;

    Ok(Book {
        id,
        title: new.title,
        author: new.author,
        file_path: new.file_path,
        cover_path: new.cover_path,
        format: new.format,
        added_at: now.clone(),
        total_pages: new.total_pages,
        updated_at: now,
    })
}

#[tauri::command]
pub fn list_books(state: State<DbState>) -> Result<Vec<Book>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, title, author, file_path, cover_path, format, added_at, total_pages, updated_at
             FROM books ORDER BY added_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Book {
                id: row.get(0)?,
                title: row.get(1)?,
                author: row.get(2)?,
                file_path: row.get(3)?,
                cover_path: row.get(4)?,
                format: row.get(5)?,
                added_at: row.get(6)?,
                total_pages: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_book(state: State<DbState>, id: String) -> Result<Option<Book>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT id, title, author, file_path, cover_path, format, added_at, total_pages, updated_at
         FROM books WHERE id = ?1",
        params![id],
        |row| {
            Ok(Book {
                id: row.get(0)?,
                title: row.get(1)?,
                author: row.get(2)?,
                file_path: row.get(3)?,
                cover_path: row.get(4)?,
                format: row.get(5)?,
                added_at: row.get(6)?,
                total_pages: row.get(7)?,
                updated_at: row.get(8)?,
            })
        },
    )
    .optional()
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_book(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM books WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}