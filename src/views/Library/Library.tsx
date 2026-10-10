// src/views/Library/Library.tsx
import type { useLibraryViewModel } from '../../viewmodels/useLibraryViewModel';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { Button } from '../../components/Button';
import { CloseIcon } from '../../components/icons';
import { BookCard } from './Books';
import cover from '../../assets/cover.webp';

type Props = { library: ReturnType<typeof useLibraryViewModel> };

export function Library({ library }: Props) {
  const term = library.query.trim();
  return (
    <main
  className="min-h-screen w-full bg-cover bg-center bg-no-repeat md:bg-fixed"
  style={{
    backgroundColor: 'var(--color-canvas)',
    backgroundImage: `linear-gradient(rgba(247,244,239,0.25), rgba(247,244,239,0.25)), url(${cover})`,
  }}
>
        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-4 pb-10 pt-12 md:max-w-[720px] md:gap-8 md:px-6 md:pt-16 lg:max-w-[1120px] xl:max-w-[1400px] 2xl:max-w-[1680px]">        {library.updateInfo && (
          <div
            className="flex items-center justify-between gap-3 rounded-md px-4 py-3 text-[13px] md:rounded-lg md:text-[15px]"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-primary)' }}
            role="status"
          >
            <span>
              Version <strong>{library.updateInfo.latestVersion}</strong> is available (you have{' '}
              {library.updateInfo.currentVersion}).
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <Button
                size="sm"
                onClick={library.installUpdate}
                disabled={!library.updateInfo.apkUrl}
              >
                Update
              </Button>
              <IconButton
                size="sm"
                onClick={library.dismissUpdate}
                aria-label="Dismiss update notice"
              >
                <CloseIcon />
              </IconButton>
            </span>
          </div>
        )}

        {/* Header */}
        <header className="lib-head">
          <div className="min-w-0">
            <h1 className="lib-title">Library</h1>
            <div className="lib-meta">
              {library.books.length === 1 ? '1 book' : `${library.books.length} books`}
            </div>
          </div>
        </header>

        {/* Search + import */}
        <section className="search-row" aria-label="Search and import">
          <div className="search-well">
            <Icon className="ic text-fg-muted">
              <path d="m21 21l-4.34-4.34" />
              <circle cx="11" cy="11" r="8" />
            </Icon>
            <input
              type="search"
              value={library.query}
              onChange={(e) => library.setQuery(e.target.value)}
              placeholder="Search titles & authors"
              aria-label="Search library"
            />
          </div>
          <IconButton
            onClick={library.importBook}
            disabled={library.importing}
            aria-label="Import books"
          >
            <Icon size={22}>
              <path d="M12 3v12m-4-4l4 4l4-4" />
              <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
            </Icon>
          </IconButton>
        </section>

        {/* Shelf */}
        {library.loadingLibrary ? (
          <p className="px-1 text-[13px] text-fg-muted md:px-0 md:text-[15px]">Loading library…</p>
        ) : library.books.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-md bg-surface px-6 py-14 text-center md:gap-5 md:rounded-lg">
            <span className="text-[32px] leading-none md:text-[44px]">📖</span>
            <h2 className="font-display text-[17px] leading-[22px] md:text-[26px] md:leading-[30px]">
              Nothing on the shelf yet
            </h2>
            <p className="max-w-[420px] text-[13px] text-fg-muted md:text-[15px]">
              Import an EPUB or PDF and it will show up here, ready to open in the reader.
            </p>
            <Button onClick={library.importBook} disabled={library.importing}>
              {library.importing ? 'Importing…' : 'Add a book'}
            </Button>
          </div>
        ) : (
          <>
            {term && library.visibleBooks.length === 0 ? (
              <p className="text-[13px] text-fg-muted md:text-[15px]">
                Nothing matches “{library.query}”.
              </p>
            ) : (
              <section
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                aria-label="Your books"
              >      
              {library.visibleBooks.map((book, i) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    progress={library.progressById[book.id]}
                    index={i}
                    onOpen={library.openBook}
                    onRemove={library.removeBook}
                  />
                ))}
              </section>
            )}

            {/* Import row */}
            <button className="import-row" onClick={library.importBook} disabled={library.importing}>
              <span className="book-cover book-cover--dashed" aria-hidden="true">
                <Icon className="text-fg-muted">
                  <path d="M5 12h14m-7-7v14" />
                </Icon>
              </span>
              <span className="book-text">
                <span className="book-title">
                  {library.importing ? 'Importing…' : 'Import a book'}
                </span>
                <span className="book-meta">EPUB or PDF · added to this shelf</span>
              </span>
            </button>
          </>
        )}
      </div>
    </main>
  );
}