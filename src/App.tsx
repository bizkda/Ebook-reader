import { useEffect, useState } from 'react';
import { ReaderView } from './views/Reader/ReaderView';
import { Book, getAllBooks, importAndAddBook, removeBook } from './services/BookService';
import './App.css';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [importing, setImporting] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    getAllBooks()
      .then((result) => {
        if (!cancelled) setBooks(result);
      })
      .finally(() => {
        if (!cancelled) setLoadingLibrary(false);
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
      <div className="mx-auto flex h-screen w-full max-w-[393px] flex-col gap-6 px-4 pb-6 pt-8 md:h-auto md:min-h-screen md:max-w-[1600px] md:gap-10 md:px-12 md:pb-16 md:pt-14 lg:px-16">
        {/* Masthead */}
        <header className="flex items-start justify-between gap-6 md:flex-wrap md:items-end md:border-b md:border-divider md:pb-8">
          <div className="flex flex-col gap-1 md:gap-2">
            <span className="text-[13px] uppercase tracking-[0.08em] text-fg-muted">
              {books.length === 1 ? '1 book' : `${books.length} books`}
              <span className="hidden md:inline"> on the shelf</span>
            </span>
            <h1 className="font-display text-[28px] leading-[30px] md:text-[44px] md:leading-[46px]">
              Your Library
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or author"
              aria-label="Search library"
              className="hidden h-11 w-[260px] rounded-full bg-surface px-5 text-[15px] text-fg placeholder:text-fg-muted focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg md:block"
            />
            <button
              className="iconbtn md:hidden"
              onClick={handleImport}
              disabled={importing}
              aria-label="Add a book"
            >
              {importing ? '…' : '+'}
            </button>
            <button
              className="pill solid hidden h-11 md:inline-flex"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? 'Importing…' : '＋ Add a book'}
            </button>
          </div>
        </header>

        {/* Shelf */}
        <div className="flex-1 overflow-y-auto md:overflow-visible">
          {loadingLibrary ? (
            <p className="px-1 text-[13px] text-fg-muted md:px-0 md:text-[15px]">
              Loading library…
            </p>
          ) : books.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-md bg-surface px-6 py-10 text-center md:gap-5 md:rounded-lg md:px-10 md:py-24">
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
          ) : visible.length === 0 ? (
            <p className="text-[13px] text-fg-muted md:text-[15px]">
              Nothing matches “{query}”.
            </p>
          ) : (
            <ul className="flex flex-col gap-2 md:grid md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:gap-6">
              {visible.map((book) => (
                <li
                  key={book.id}
                  className="group relative flex items-center gap-2 rounded-md bg-surface pr-2 transition-transform duration-150 ease-out active:translate-y-px md:block md:bg-transparent md:pr-0 md:active:translate-y-0"
                >
                  <button
                    className="flex min-w-0 flex-1 flex-col items-start gap-1 rounded-md px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg md:h-full md:w-full md:gap-4 md:bg-surface md:p-5 md:transition-transform md:duration-150 md:ease-out md:hover:-translate-y-1"
                    onClick={() => setActiveBook(book)}
                  >
                    {/* Cover plate — desktop only */}
                    <div
                      className="hidden aspect-[3/4] w-full items-end rounded-sm p-4 md:flex"
                      style={{
                        background:
                          'linear-gradient(160deg, color-mix(in srgb, var(--color-primary) 55%, var(--color-surface-recessed)), var(--color-surface-recessed))',
                      }}
                    >
                      <span className="font-display text-[34px] leading-none text-fg opacity-70">
                        {book.title.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex w-full min-w-0 flex-col gap-1">
                      <span className="w-full truncate font-display text-[17px] leading-[22px] md:line-clamp-2 md:overflow-visible md:whitespace-normal md:text-[19px] md:leading-[24px]">
                        {book.title}
                      </span>
                      {book.author && (
                        <span className="w-full truncate text-[13px] text-fg-muted">
                          {book.author}
                        </span>
                      )}
                    </div>
                  </button>

                  <button
                    className="iconbtn shrink-0 md:absolute md:right-3 md:top-3 md:opacity-0 md:transition-opacity md:duration-150 md:ease-out md:group-hover:opacity-100 md:focus-visible:opacity-100"
                    onClick={() => handleRemove(book.id)}
                    aria-label={`Remove ${book.title}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bottom chrome — phone only */}
        {books.length > 0 && (
          <div className="tools md:hidden">
            <button className="pill solid" onClick={handleImport} disabled={importing}>
              {importing ? 'Importing…' : '＋ Add a book'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
