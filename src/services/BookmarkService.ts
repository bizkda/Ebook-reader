import { invoke } from "@tauri-apps/api/core";

export interface NewBookmark {
book_id: string;
page: number | null;
cfi: string | null;
label: string | null;
note: string | null;
}

export interface Bookmark {
id: string;
book_id: string;
page: number | null;
cfi: string | null;
label: string | null;
note: string | null;
created_at: string;
updated_at: string;
}

export async function addBookmark(bookmark: NewBookmark): Promise<Bookmark> {
    return await invoke<Bookmark>("add_bookmark", {new: bookmark});
}
export async function getBookmarks(book_id: string): Promise<Bookmark[]> {
    return await invoke<Bookmark[]>("list_bookmarks", {bookId: book_id});
}
export async function removeBookmark(bookmark_id: string): Promise<void> {
    return await invoke<void>("delete_bookmark", {id : bookmark_id});
}
export async function updateBookmarkNote(bookmark_id: string, note: string | null): Promise<void> {
    return await invoke<void>("update_bookmark_note", {bookmark_id, note});
}