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

export async function add_bookmark(
bookmark: NewBookmark
): Promise<Bookmark> {
return await invoke<Bookmark>("add_bookmark", {
new: bookmark,
});
}