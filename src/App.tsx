import { useEffect, useState } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { ReaderView } from './views/Reader/ReaderView';
import { Book, getAllBooks, importAndAddBook, removeBook } from './services/BookService';
import { listProgress } from './services/ProgressService';
import './App.css';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [importing, setImporting] = useState(false);
  const [query, setQuery] = useState('');
  const [progressById, setProgressById] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    getAllBooks()
      .then((bookResult) => {
        if (cancelled) return;
        setBooks(bookResult);
      })
      .catch((err) => {
        console.error('Failed to load books:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingLibrary(false);
      });

    listProgress()
    .then((progressResult) => {
      console.log('Raw progress from backend:', progressResult);

      if (cancelled) return;

      const percentages: Record<string, number> = {};
      for (const bookId in progressResult) {
        percentages[bookId] = progressResult[bookId].percentage;
      }

      console.log('Percentages by book id:', percentages);
      setProgressById(percentages);
    })
    .catch((err) => {
      console.error('Failed to load progress:', err);
      // leave progressById as {} — rows just show "—"
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleImport() {
    setImporting(true);
    try {
      const book = await importAndAddBook();
      if (book) setBooks((prev) => [...prev, book]);
    } finally {
      setImporting(false);
    }
  }

  async function handleRemove(id: string) {
    await removeBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  if (activeBook) {
    return <ReaderView book={activeBook} onClose={() => setActiveBook(null)} />;
  }

  const term = query.trim().toLowerCase();
  const visible = term
    ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          (b.author ?? '').toLowerCase().includes(term),
      )
    : books;

  return (
    <main
      className="min-h-screen w-full"
      style={{
        backgroundColor: 'var(--color-canvas)',
        backgroundImage: 'radial-gradient(rgba(26,26,26,0.045) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-4 pb-10 pt-12 md:max-w-[720px] md:gap-8 md:px-0 md:pt-16">
        {/* Header */}
        <header className="lib-head">
          <div className="min-w-0">
            <h1 className="lib-title">Library</h1>
            <div className="lib-meta">{books.length === 1 ? '1 book' : `${books.length} books`}</div>
          </div>
        </header>

        {/* Search + import */}
        <section className="search-row" aria-label="Search and import">
          <div className="search-well">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ic"
              style={{ color: 'var(--color-fg-muted)', width: 20, height: 20 }}
              aria-hidden="true"
            >
              <path d="m21 21l-4.34-4.34" />
              <circle cx="11" cy="11" r="8" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles & authors"
              aria-label="Search library"
            />
          </div>
          <button
            className="icon-btn"
            onClick={handleImport}
            disabled={importing}
            aria-label="Import books"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 22, height: 22 }}
              aria-hidden="true"
            >
              <path d="M12 3v12m-4-4l4 4l4-4" />
              <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
            </svg>
          </button>
        </section>

        {/* Shelf */}
        {loadingLibrary ? (
          <p className="px-1 text-[13px] text-fg-muted md:px-0 md:text-[15px]">Loading library…</p>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-md bg-surface px-6 py-14 text-center md:gap-5 md:rounded-lg">
            <span className="text-[32px] leading-none md:text-[44px]">📖</span>
            <h2 className="font-display text-[17px] leading-[22px] md:text-[26px] md:leading-[30px]">
              Nothing on the shelf yet
            </h2>
            <p className="max-w-[420px] text-[13px] text-fg-muted md:text-[15px]">
              Import an EPUB or PDF and it will show up here, ready to open in the reader.
            </p>
            <button className="pill solid" onClick={handleImport} disabled={importing}>
              {importing ? 'Importing…' : 'Add a book'}
            </button>
          </div>
        ) : (
          <>
            {term && visible.length === 0 ? (
              <p className="text-[13px] text-fg-muted md:text-[15px]">Nothing matches “{query}”.</p>
            ) : (
              <section className="shelf" aria-label="Your books">
                {visible.map((book) => {
                  const progressstr = progressById[book.id];
                  const progress = progressstr * 100;
                  return (
                    <div key={book.id} className="book-row group">
                      <button className="book-row-main" onClick={() => setActiveBook(book)}>
                        {book.cover_path ? (
                          <img
                            className="book-cover book-cover-img"
                            src={convertFileSrc(book.cover_path)}
                            alt=""
                            aria-hidden="true"
                          />
                        ) : (
                          <span
                            className="book-cover"
                            style={{
                              background:
                                'linear-gradient(160deg, color-mix(in srgb, var(--color-primary) 55%, var(--color-surface-recessed)), var(--color-surface-recessed))',
                            }}
                            aria-hidden="true"
                          >
                            <span className="book-cover-letter">{book.title.charAt(0).toUpperCase()}</span>
                          </span>
                        )}
                        <span className="book-text">
                          <span className="book-title">{book.title}</span>
                          {book.author && <span className="book-meta">{book.author}</span>}
                        </span>
                        <span className="book-pct">
                          {typeof progress === 'number' ? `${Math.round(progress)}%` : '—'}
                        </span>
                      </button>
                      <button
                        className="icon-btn book-remove"
                        onClick={() => handleRemove(book.id)}
                        aria-label={`Remove ${book.title}`}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </section>
            )}

            {/* Import row */}
            <button className="import-row" onClick={handleImport} disabled={importing}>
              <span className="book-cover book-cover--dashed" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 20, height: 20, color: 'var(--color-fg-muted)' }}
                >
                  <path d="M5 12h14m-7-7v14" />
                </svg>
              </span>
              <span className="book-text">
                <span className="book-title">{importing ? 'Importing…' : 'Import a book'}</span>
                <span className="book-meta">EPUB or PDF · added to this shelf</span>
              </span>
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default App;