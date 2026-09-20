// src-tauri/src/lib.rs
use tauri::Manager;
pub mod db;
pub mod models;
pub mod commands;

use db::init_db;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let db_state = init_db(app);
            app.manage(db_state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::book::add_book,
            commands::book::list_books,
            commands::book::get_book,
            commands::book::delete_book,
            commands::bookmark::add_bookmark,
            commands::bookmark::list_bookmarks,
            commands::bookmark::delete_bookmark,
            commands::bookmark::update_bookmark_note,
            commands::progress::upsert_progress,
            commands::progress::get_progress,
            commands::progress::list_recently_read,
            commands::progress::list_all_progress
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}