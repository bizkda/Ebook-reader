// src-tauri/src/models/book.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Book {
    pub id: String,
    pub title: String,
    pub author: Option<String>,
    pub file_path: String,
    pub cover_path: Option<String>,
    pub format: String,
    pub added_at: String,
    pub total_pages: Option<i64>,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct NewBook {
    pub title: String,
    pub author: Option<String>,
    pub file_path: String,
    pub cover_path: Option<String>,
    pub format: String,
    pub total_pages: Option<i64>,
}