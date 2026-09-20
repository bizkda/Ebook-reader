// src/services/ProgressService.ts
import { invoke } from '@tauri-apps/api/core';

export interface ReadingProgress {
  book_id: string;
  current_page: number;
  current_cfi: string | null;
  percentage: number;
  last_read_at: string | null;
  updated_at: string;
}

export interface UpdateProgress {
  book_id: string;
  current_page: number;
  current_cfi?: string | null;
  percentage: number;
}

/**
 * Fetches progress for every book in one call, keyed by book_id.
 * Assumes a `list_progress` Tauri command returning ReadingProgress[].
 * Used by the library screen so it isn't issuing one invoke per row.
 */
export async function listProgress(): Promise<Record<string, ReadingProgress>> {
  const rows = await invoke<ReadingProgress[]>('list_all_progress');
  const byBookId: Record<string, ReadingProgress> = {};
  for (const row of rows) {
    byBookId[row.book_id] = row;
  }
  return byBookId;
}

/** Assumes a `get_progress` command returning ReadingProgress | null. */
export async function getProgress(bookId: string): Promise<ReadingProgress | null> {
  return await invoke<ReadingProgress | null>('get_progress', { bookId });
}

/**
 * Assumes an `update_progress` command taking an UpdateProgress payload
 * and returning the saved ReadingProgress. Call this from ReaderView as
 * the reader moves through pages/CFIs.
 */
export async function updateProgress(progress: UpdateProgress): Promise<ReadingProgress> {
  return await invoke<ReadingProgress>('update_progress', { progress });
}