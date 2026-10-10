// src/views/Library/Books.tsx
import { convertFileSrc } from '@tauri-apps/api/core';
import type { Book } from '../../services/BookService';
import { IconButton } from '../../components/IconButton';
import { CloseIcon } from '../../components/icons';

const DISPLAY = 'font-[family-name:var(--font-blob-display)]';
const BODY = 'font-[family-name:var(--font-blob-body)]';

function BookCover({ book }: { book: Book }) {
   if (book.cover_path) {
    return (
      <img
        src={convertFileSrc(book.cover_path)}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="aspect-[3/3] w-full rounded-[16px] object-cover object-top outline outline-1 -outline-offset-1 outline-black/5"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex aspect-[3/3] w-full items-center justify-center rounded-[16px]"
      style={{
        background: 'linear-gradient(160deg, color-mix(in srgb, #5B3FE4 30%, #ebf2f5), #ebf2f5)',
      }}
    >
      <span className={`${DISPLAY} text-[64px] font-medium leading-none text-[#5B3FE4]`}>
        {book.title.charAt(0).toUpperCase()}
      </span>
    </span>
  );
}

interface BookCardProps {
  book: Book;
  /** 0–1, or undefined if the book hasn't been opened yet */
  progress?: number;
  /** position in the list, used to stagger the entrance */
  index?: number;
  onOpen: (book: Book) => void;
  onRemove: (id: string) => void;
}

export function BookCard({ book, progress = 0, index = 0, onOpen, onRemove }: BookCardProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const pct = Math.round(clamped * 100);
  const pagesRead = book.total_pages ? Math.round(clamped * book.total_pages) : null;

  return (
    <article
      className={`book-reveal relative flex flex-col rounded-[24px] bg-[#ebebeb] p-3 text-[15px] text-[#1B1B1F] transition-opacity duration-[120ms] hover:opacity-[.94] active:opacity-[.88] ${BODY}`}
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
    >
      <button
        type="button"
        onClick={() => onOpen(book)}
        className="flex flex-col gap-3 rounded-[16px] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B3FE4]"
      >
        <BookCover book={book} />

        <span className="flex flex-col gap-2 px-2 pb-1">
          <span
            className={`${DISPLAY} line-clamp-2 text-[20px] font-medium leading-6 tracking-[-0.01em]`}
          >
            {book.title}
          </span>
          {book.author && (
            <span className="-mt-1 text-[13px] text-[#616369]">{book.author}</span>
          )}

          <span className="flex items-center gap-3">
            <span
              role="progressbar"
              aria-label={`Progress for ${book.title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              className="block h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-[#e3e7e9]"
            >
              <span
                className="block h-full rounded-full bg-[#5B3FE4] transition-[width] duration-[360ms] ease-[cubic-bezier(0.2,0,0,1)]"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="whitespace-nowrap text-[13px] font-medium text-[#5B3FE4]">{pct}%</span>
            {pagesRead !== null && (
              <span className="whitespace-nowrap text-[13px] tabular-nums text-[#616369]">
                {pagesRead} / {book.total_pages} pages
              </span>
            )}
          </span>
        </span>
      </button>

      <IconButton
        size="sm"
        className="absolute right-5 top-5 shadow-[0_1px_2px_rgba(27,27,31,0.08)]"
        onClick={() => onRemove(book.id)}
        aria-label={`Remove ${book.title}`}
      >
        <CloseIcon />
      </IconButton>
    </article>
  );
}