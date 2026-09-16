// src-tauri/src/models/bookmark.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Bookmark {
    pub id: String,
    pub book_id: String,
    pub page: Option<i64>,
    pub cfi: Option<String>,
    pub label: Option<String>,
    pub note: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct NewBookmark {
    pub book_id: String,
    pub page: Option<i64>,
    pub cfi: Option<String>,
    pub label: Option<String>,
    pub note: Option<String>,
}