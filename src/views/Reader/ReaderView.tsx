import { useEffect, useRef, useState } from 'react';
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
  contentClickTick} = useReaderViewModel(book);


  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5;
  const overlayOpacity = (temperature / 100) * 0.4;

  const toggleControls = () => setControlsVisible((v) => !v);
  const [zoomDraft, setZoomDraft] = useState<string | null>(null);

  const commitZoom = () => {
    if (zoomDraft === null) return;
    const value = Number(zoomDraft);
    if (!Number.isNaN(value) && zoomDraft.trim() !== '') {
      setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value / 100)));
    }
    setZoomDraft(null);
  };
  const [controlsVisible, setControlsVisible] = useState(true);
  const isFirstClick = useRef(true);

  useEffect(() => {
    if (isFirstClick.current) {
      isFirstClick.current = false;
      return;
    }
    setControlsVisible((v) => !v);
  }, [contentClickTick]);
  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      style={{
        backgroundColor: 'var(--color-canvas)',
        backgroundImage: 'radial-gradient(rgba(26,26,26,0.045) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Full-bleed reader surface, always full window */}
      <div className="absolute inset-0" onClick={toggleControls}>
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

      {/* Top bar — floating, transparent, fades in/out */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-6 px-4 pt-8 transition-opacity duration-200 md:px-10 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)',
        }}
      >
        <div className={`flex min-w-0 items-center gap-3 pb-4 md:gap-4 ${controlsVisible ? 'pointer-events-auto' : ''}`}>
          <button
            className="iconbtn hidden shrink-0 backdrop-blur-md md:inline-flex"
            onClick={onClose}
            aria-label="Back to library"
          >
            ←
          </button>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="block truncate text-[13px] uppercase tracking-[0.08em] text-fg-muted">
              {book.title}
            </span>
            <span className="font-display text-[17px] leading-[22px] md:text-[22px] md:leading-[26px]">
              Chapter
            </span>
          </div>
        </div>

        <div className={`flex shrink-0 items-center gap-2 pb-4 md:gap-4 ${controlsVisible ? 'pointer-events-auto' : ''}`}>
          <div className="hidden items-center gap-3 md:flex">
            <label className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-1.5 text-fg-muted backdrop-blur-md">
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
            <span className="pill backdrop-blur-md">{Math.round(zoom * 100)}%</span>
          </div>

          <button className="iconbtn backdrop-blur-md md:hidden" onClick={onClose} aria-label="Back to library">
            ←
          </button>
          <button
            className="iconbtn backdrop-blur-md"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Desktop page-turn rails — floating over the page */}
      <button
        className={`iconbtn pointer-events-auto absolute left-4 top-1/2 hidden -translate-y-1/2 backdrop-blur-md transition-opacity duration-200 md:inline-flex ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          prevPage();
        }}
        aria-label={isPdf ? 'Prev page' : 'Prev chapter'}
      >
        ‹
      </button>
      <button
        className={`iconbtn pointer-events-auto absolute right-4 top-1/2 hidden -translate-y-1/2 backdrop-blur-md transition-opacity duration-200 md:inline-flex ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          nextPage();
        }}
        aria-label={isPdf ? 'Next page' : 'Next chapter'}
      >
        ›
      </button>

      {/* Bottom chrome — floating, transparent, fades in/out */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 px-4 pb-6 pt-10 transition-opacity duration-200 md:flex-row md:items-center md:justify-center md:px-10 md:pb-10 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)',
        }}
      >
        <div className={`tools mx-auto rounded-full bg-black/20 backdrop-blur-md md:gap-3 ${controlsVisible ? 'pointer-events-auto' : ''}`}>
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
              value={zoomDraft ?? Math.round(zoom * 100)}
              onChange={(e) => setZoomDraft(e.target.value)}
              onBlur={commitZoom}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitZoom();
                  e.currentTarget.blur();
                }
              }}
            aria-label="Zoom percentage"
            className="
              h-11 w-14
              rounded-full
              border-0
              bg-transparent
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
        <label className={`flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 text-fg-muted backdrop-blur-md md:hidden ${controlsVisible ? 'pointer-events-auto' : ''}`}>
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
  );
}