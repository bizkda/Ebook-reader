// src/viewmodels/useBookmarkViewModel.ts
import { useEffect, useState, useCallback } from 'react';
import {
  Bookmark,
  getBookmarks,
  addBookmark as addBookmarkRecord,
  removeBookmark,
} from '../services/BookmarkService';

type NewBookmark = Omit<Bookmark, 'id' | 'book_id' | 'created_at' | 'updated_at'>;

export function useBookmarkViewModel(bookId: string | null) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  useEffect(() => {
    if (!bookId) {
      setBookmarks([]);
      return;
    }

    let cancelled = false;
    setLoadingBookmarks(true);

    getBookmarks(bookId)
      .then((result) => {
        if (!cancelled) setBookmarks(result);
      })
      .catch((err) => console.error('Failed to load bookmarks:' ,{ book_id: bookId }, err))
      .finally(() => {
        if (!cancelled) setLoadingBookmarks(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  const add = useCallback(
    async (input: NewBookmark) => {
      if (!bookId) return;
      const created = await addBookmarkRecord({ book_id: bookId, ...input });
      setBookmarks((prev) => [...prev, created]);
    },
    [bookId],
  );

  const remove = useCallback(async (id: Bookmark['id']) => {
    await removeBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const isBookmarked = useCallback(
    (page: number) => bookmarks.some((b) => b.page === page),
    [bookmarks],
  );

  return {
    bookmarks,
    loadingBookmarks,
    addBookmark: add,
    removeBookmark: remove,
    isBookmarked,
  };
}