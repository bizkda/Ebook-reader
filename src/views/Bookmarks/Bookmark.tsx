import { useMemo, useState } from 'react';
import { Bookmark } from '../../services/BookmarkService';
import { useBookmarkViewModel } from '../../viewmodels/useBookmarkViewModel';

interface BookmarkViewProps {
  bookId: string;
  currentPage?: number;
  currentCfi?: string;
  onSelect?: (bookmark: Bookmark) => void;
  onClose?: () => void;
}

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const iconBtn =
  'inline-flex shrink-0 items-center justify-center rounded-full bg-white text-[#6d6965] transition hover:opacity-85 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a]';

export function BookmarkView({
  bookId,
  currentPage,
  currentCfi,
  onSelect,
  onClose,
}: BookmarkViewProps) {
  const { bookmarks, loadingBookmarks, addBookmark, removeBookmark } =
    useBookmarkViewModel(bookId);

  const [page, setPage] = useState<number | null>(currentPage ?? null);
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (page === null) return;
    setSaving(true);
    try {
      await addBookmark({
        page,
        // only attach the CFI if the page is the one the reader is on
        cfi: page === currentPage ? (currentCfi ?? null) : null,
        label: label.trim() || null,
        note: note.trim() || null,
      });
      setLabel('');
      setNote('');
    } catch (err) {
      console.error('Failed to add bookmark:', err);
    } finally {
      setSaving(false);
    }
  };

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const sorted = [...bookmarks].sort((a, b) => (a.page ?? 0) - (b.page ?? 0));
    if (!term) return sorted;
    return sorted.filter(
      (b) =>
        (b.label ?? '').toLowerCase().includes(term) ||
        (b.note ?? '').toLowerCase().includes(term) ||
        String(b.page).includes(term),
    );
  }, [bookmarks, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto bg-[#f7f4ef] px-4 pb-10 pt-8 text-[#1a1a1a]">
      {/* Masthead */}
      <header className="flex items-center justify-between">
        <h1 className="font-display text-[34px] font-medium leading-[36px] tracking-[-0.02em]">
          Bookmarks
        </h1>
        <button className={`${iconBtn} h-10 w-10`} onClick={onClose} aria-label="Close bookmarks">
          <Icon>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </Icon>
        </button>
      </header>

      {/* Search well */}
      <label className="flex items-center gap-3 rounded-full bg-[#edeae5] px-5 py-3 text-[#6d6965] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-black/[0.06]">
        <Icon>
          <path d="m21 21-4.34-4.34" />
          <circle cx="11" cy="11" r="8" />
        </Icon>
        <input
          type="search"
          placeholder="Search bookmarks"
          aria-label="Search bookmarks"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-[16px] text-[#1a1a1a] outline-none placeholder:text-[#6d6965]"
        />
      </label>

      {/* Add strip */}
      <section className="bm-reveal flex flex-col gap-3 rounded-[16px] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-display text-[24px] font-medium leading-[24px]">Save this spot</div>
            <p className="mt-1 text-[13px] text-[#6d6965]">Add a label or note, if you like</p>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-[#6d6965]">
            Page
            <input
              type="number"
              min={1}
              value={page ?? ''}
              onChange={(e) => setPage(e.target.value ? Number(e.target.value) : null)}
              className="w-16 rounded-full bg-[#edeae5] px-3 py-2 text-center text-[16px] text-[#1a1a1a] outline-none [appearance:textfield] focus:outline focus:outline-2 focus:outline-black/[0.06] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </label>
        </div>

        <input
          type="text"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="rounded-full bg-[#edeae5] px-5 py-3 text-[16px] text-[#1a1a1a] outline-none placeholder:text-[#6d6965] focus:outline focus:outline-2 focus:outline-black/[0.06]"
        />
        <textarea
          placeholder="Note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="resize-none rounded-[16px] bg-[#edeae5] px-5 py-3 text-[16px] text-[#1a1a1a] outline-none placeholder:text-[#6d6965] focus:outline focus:outline-2 focus:outline-black/[0.06]"
        />

        <button
          onClick={handleAdd}
          disabled={page === null || saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f3c9a0] px-6 py-4 text-[16px] font-medium text-black shadow-[0_6px_16px_rgba(26,26,26,0.12)] transition hover:-translate-y-px active:translate-y-px active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a] disabled:opacity-50"
        >
          <Icon>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </Icon>
          {saving ? 'Saving…' : 'Add bookmark'}
        </button>
      </section>

      {/* Dateline */}
      <div className="flex items-center gap-3 text-[#6d6965] before:h-px before:flex-1 before:bg-black/[0.04] before:content-[''] after:h-px after:flex-1 after:bg-black/[0.04] after:content-['']">
        <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.08em]">
          {bookmarks.length} saved
        </span>
      </div>

      {/* Front page */}
      <section className="flex flex-col">
        <h2 className="mb-4 font-display text-[20px] font-medium leading-[24px]">Saved pages</h2>

        {loadingBookmarks ? (
          <p className="py-6 text-[13px] text-[#6d6965]">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="py-6 text-[13px] text-[#6d6965]">
            {bookmarks.length === 0 ? 'Nothing saved yet.' : 'No matches.'}
          </p>
        ) : (
          visible.map((bookmark, i) => (
            <div
              key={bookmark.id}
              className="bm-reveal flex min-h-[96px] items-center gap-4 border-t border-black/[0.04] py-4 first:border-t-0"
              style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              <button
                className="flex min-w-0 flex-1 items-center gap-4 text-left"
                onClick={() => onSelect?.(bookmark)}
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#edeae5] font-display text-[20px] font-medium outline outline-1 -outline-offset-1 outline-black/5">
                  {bookmark.page}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-[16px] font-medium leading-[22px] tracking-[-0.01em]">
                    {bookmark.label ?? `Page ${bookmark.page}`}
                  </span>
                  <span className="mt-2 line-clamp-2 block text-[13px] text-[#6d6965]">
                    {bookmark.note ?? `Page ${bookmark.page}`}
                  </span>
                </span>
              </button>
              <button
                className={`${iconBtn} h-9 w-9`}
                onClick={() => removeBookmark(bookmark.id)}
                aria-label="Delete bookmark"
              >
                <Icon>
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </Icon>
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}