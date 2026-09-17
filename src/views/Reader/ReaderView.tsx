import { useReaderViewModel } from '../../viewmodels/useReaderViewModel';
import { Book } from '../../services/BookService';

interface ReaderViewProps {
  book: Book;
  onClose: () => void;
}

export function ReaderView({ book, onClose }: ReaderViewProps) {
  const {
    attachContainer, loading, isPdf, zoom, setZoom, nextPage, prevPage,
    darkMode, setDarkMode, temperature, setTemperature,
  } = useReaderViewModel(book);

  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5;
  const overlayOpacity = (temperature / 100) * 0.4;

  return (
    <div
      className="h-screen w-full"
      style={{
        backgroundColor: 'var(--color-canvas)',
        backgroundImage: 'radial-gradient(rgba(26,26,26,0.045) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="mx-auto flex h-screen w-full max-w-[393px] flex-col gap-6 px-4 pb-6 pt-8 md:max-w-none md:gap-8 md:px-10 md:pb-10 md:pt-8 md:h-[100dvh]">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <button
              className="iconbtn hidden shrink-0 md:inline-flex"
              onClick={onClose}
              aria-label="Back to library"
            >
              ←
            </button>
            <div className="flex min-w-0 flex-col gap-1">
              {/* TODO: replace with real chapter label once the view model exposes one */}
              <span className="block truncate text-[13px] uppercase tracking-[0.08em] text-fg-muted">
                {book.title}
              </span>
              <span className="font-display text-[17px] leading-[22px] md:text-[22px] md:leading-[26px]">
                Chapter
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:gap-4">
            {/* Desktop-only inline controls */}
            <div className="hidden items-center gap-3 md:flex">
              <label className="flex items-center gap-2 text-fg-muted">
                🌡️
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  aria-label="Warmth"
                  className="w-[140px] accent-primary"
                />
              </label>
              <span className="pill">{Math.round(zoom * 100)}%</span>
            </div>

            <button className="iconbtn md:hidden" onClick={onClose} aria-label="Back to library">
              ←
            </button>
            <button
              className="iconbtn"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Reader surface + temperature overlay */}
        <div className="relative flex min-h-0 flex-1 items-stretch justify-center md:gap-4">
          {/* Desktop page-turn rails */}
          <button
            className="iconbtn hidden self-center md:inline-flex"
            onClick={prevPage}
            aria-label={isPdf ? 'Prev page' : 'Prev chapter'}
          >
            ‹
          </button>

          <div className="relative h-full flex-1 overflow-hidden rounded-md bg-surface md:w-full md:rounded-lg">
            {loading && <div className="p-4 text-fg-muted">Loading…</div>}
            <div ref={attachContainer} className="h-full w-full overflow-auto" />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundColor: `rgba(255,158,0,${overlayOpacity})`,
                mixBlendMode: 'multiply',
              }}
            />
          </div>

          <button
            className="iconbtn hidden self-center md:inline-flex"
            onClick={nextPage}
            aria-label={isPdf ? 'Next page' : 'Next chapter'}
          >
            ›
          </button>
        </div>

        {/* Bottom chrome */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-center">
          <div className="tools md:gap-3">
            <button className="iconbtn md:hidden" onClick={prevPage} aria-label={isPdf ? 'Prev page' : 'Prev chapter'}>
              ‹
            </button>
            <button
              className="iconbtn"
              onClick={() => setZoom(Math.max(MIN_ZOOM, zoom - ZOOM_STEP))}
              aria-label="Zoom out"
            >
              −
            </button>

            <input
              type="number"
              min={MIN_ZOOM * 100}
              max={MAX_ZOOM * 100}
              value={Math.round(zoom * 100)}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (!Number.isNaN(value)) {
                  setZoom(
                    Math.min(
                      MAX_ZOOM,
                      Math.max(MIN_ZOOM, value / 100)
                    )
                  );
                }
              }}
              aria-label="Zoom percentage"
              className="
                h-11 w-14
                rounded-full
                border-0
                bg-surface
                px-0
                text-center
                text-[13px]
                text-fg-muted
                outline-none
                transition
                hover:bg-surface-elevated
                focus:bg-surface-elevated
                focus:ring-2
                focus:ring-fg
                [appearance:textfield]
                [&::-webkit-inner-spin-button]:appearance-none
                [&::-webkit-outer-spin-button]:appearance-none
              "
            />


            <button
              className="iconbtn"
              onClick={() => setZoom(Math.min(MAX_ZOOM, zoom + ZOOM_STEP))}
              aria-label="Zoom in"
            >
              +
            </button>

            <button className="iconbtn md:hidden" onClick={nextPage} aria-label={isPdf ? 'Next page' : 'Next chapter'}>
              ›
            </button>
          </div>

          {/* Phone-only warmth slider */}
          <label className="flex items-center gap-2 px-1 text-fg-muted md:hidden">
            🌡️
            <input
              type="range"
              min={0}
              max={100}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              aria-label="Warmth"
              className="w-full accent-primary"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
