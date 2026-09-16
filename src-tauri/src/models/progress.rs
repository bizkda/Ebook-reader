// src-tauri/src/models/progress.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ReadingProgress {
    pub book_id: String,
    pub current_page: i64,
    pub current_cfi: Option<String>,
    pub percentage: f64,
    pub last_read_at: Option<String>,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProgress {
    pub book_id: String,
    pub current_page: i64,
    pub current_cfi: Option<String>,
    pub percentage: f64,
}