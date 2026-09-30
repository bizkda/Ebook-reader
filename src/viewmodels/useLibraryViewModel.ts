// src/viewmodels/useLibraryViewModel.ts
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Book, getAllBooks, importAndAddBook, removeBook } from '../services/BookService';
import { listProgress } from '../services/ProgressService';
import { checkForUpdate, downloadUpdate, UpdateInfo } from '../services/update/UpdateChecker';

export function useLibraryViewModel() {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [importing, setImporting] = useState(false);
  const [query, setQuery] = useState('');
  const [progressById, setProgressById] = useState<Record<string, number>>({});
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getAllBooks()
      .then((result) => {
        if (!cancelled) setBooks(result);
      })
      .catch((err) => console.error('Failed to load books:', err))
      .finally(() => {
        if (!cancelled) setLoadingLibrary(false);
      });

    listProgress()
      .then((result) => {
        if (cancelled) return;
        const percentages: Record<string, number> = {};
        for (const bookId in result) {
          percentages[bookId] = result[bookId].percentage;
        }
        setProgressById(percentages);
      })
      .catch((err) => console.error('Failed to load progress:', err));

    checkForUpdate()
      .then((info) => {
        if (!cancelled && info.available) setUpdateInfo(info);
      })
      .catch((err) => console.error('Update check failed:', err));

    return () => {
      cancelled = true;
    };
  }, []);

  const importBook = useCallback(async () => {
    setImporting(true);
    try {
      const book = await importAndAddBook();
      if (book) setBooks((prev) => [...prev, book]);
    } finally {
      setImporting(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    await removeBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const installUpdate = useCallback(async () => {
    if (updateInfo?.apkUrl) await downloadUpdate(updateInfo.apkUrl);
  }, [updateInfo]);

  const dismissUpdate = useCallback(() => setUpdateDismissed(true), []);
  const openBook = useCallback((book: Book) => setActiveBook(book), []);
  const closeBook = useCallback(() => setActiveBook(null), []);

  const visibleBooks = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        (b.author ?? '').toLowerCase().includes(term),
    );
  }, [books, query]);

  return {
    books,
    visibleBooks,
    activeBook,
    loadingLibrary,
    importing,
    query,
    setQuery,
    progressById,
    updateInfo: updateDismissed ? null : updateInfo,
    importBook,
    removeBook: remove,
    installUpdate,
    dismissUpdate,
    openBook,
    closeBook,
  };
}