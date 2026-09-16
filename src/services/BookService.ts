// src/services/BookService.ts
import { invoke } from '@tauri-apps/api/core';
import { pickBookFile, importBookFile } from './FileSystemService';

export interface Book {
  id: string;
  title: string;
  author: string | null;
  file_path: string;
  cover_path: string | null;
  format: string;
  added_at: string;
  total_pages: number | null;
  updated_at: string;
}

export async function importAndAddBook(): Promise<Book | null> {
  const picked = await pickBookFile();
  if (!picked) return null;

  const destPath = await importBookFile(picked);
  const format = destPath.split('.').pop()!.toLowerCase();
  const fileName = destPath.split(/[\\/]/).pop()!;
  const title = fileName.replace(/\.(epub|pdf)$/i, '');

  return await invoke<Book>('add_book', {
    new: {
      title,
      author: null,
      file_path: destPath,
      cover_path: null,
      format,
      total_pages: null,
    },
  });
}

export async function getAllBooks(): Promise<Book[]> {
  return await invoke<Book[]>('list_books');
}

export async function getBook(id: string): Promise<Book | null> {
  return await invoke<Book | null>('get_book', { id });
}

export async function removeBook(id: string): Promise<void> {
  await invoke('delete_book', { id });
}