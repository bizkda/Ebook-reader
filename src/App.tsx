import { useEffect, useState } from 'react';
import { ReaderView } from './views/Reader/ReaderView';
import { Book, getAllBooks, importAndAddBook, removeBook } from './services/BookService';
import './App.css';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [importing, setImporting] = useState(false);

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

  return (
    <main className="container">
      <header className="library-header">
        <h1>Your Library</h1>
        <button onClick={handleImport} disabled={importing}>
          {importing ? 'Importing…' : 'Add a book…'}
        </button>
      </header>

      {loadingLibrary ? (
        <p>Loading library…</p>
      ) : books.length === 0 ? (
        <p>No books yet. Add one to get started.</p>
      ) : (
        <ul className="library-list">
          {books.map((book) => (
            <li key={book.id} className="library-list__item">
              <button
                className="library-list__open"
                onClick={() => setActiveBook(book)}
              >
                <span className="library-list__title">{book.title}</span>
                {book.author && <span className="library-list__author">{book.author}</span>}
              </button>
              <button
                className="library-list__remove"
                onClick={() => handleRemove(book.id)}
                aria-label={`Remove ${book.title}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;