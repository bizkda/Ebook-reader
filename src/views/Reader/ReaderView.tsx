import { useEffect, useRef, useState } from 'react';
import { useReaderViewModel } from '../../viewmodels/useReaderViewModel';
import { Book } from '../../services/BookService';
import { usePinchZoom } from '../../hooks/usePinchZoom';
import { IconButton } from '../../components/IconButton';
import {
  ArrowLeftIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
  ThermometerIcon,
  ZoomIcon

} from '../../components/icons';
import { BookmarkView } from '../Bookmarks/Bookmark';
import { Bookmark } from '../../services/BookmarkService';

interface ReaderViewProps {
  book: Book;
  onClose: () => void;
}

export function ReaderView({ book, onClose }: ReaderViewProps) {
  const {
    attachContainer, loading, isPdf, zoom, setZoom, nextPage, prevPage,
    darkMode, setDarkMode, temperature, setTemperature,
    contentClickTick, currentPage, currentCfi, goToBookmark, location,
  } = useReaderViewModel(book);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5;
  const overlayOpacity = (temperature / 100) * 0.4;
  const progressPct = Math.round((location?.percentage ?? 0) * 100);
  const zoomToSlider = (z: number) =>
  (Math.log(z / MIN_ZOOM) / Math.log(MAX_ZOOM / MIN_ZOOM)) * 100;
const sliderToZoom = (v: number) =>
  MIN_ZOOM * Math.pow(MAX_ZOOM / MIN_ZOOM, v / 100);

  const toggleControls = () => setControlsVisible((v) => !v);


 
  const [controlsVisible, setControlsVisible] = useState(true);
  const isFirstClick = useRef(true);
  const viewerRef = useRef<HTMLDivElement>(null);
  usePinchZoom(viewerRef, zoom, setZoom, MIN_ZOOM, MAX_ZOOM);


  

  useEffect(() => {
    if (isFirstClick.current) {
      isFirstClick.current = false;
      return;
    }
    setControlsVisible((v) => !v);
  }, [contentClickTick]);

  // shared by both side pills: fade with the other controls
  const sideVisibility = controlsVisible
    ? 'pointer-events-auto opacity-100'
    : 'pointer-events-none opacity-0';

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
      <div
        ref={viewerRef}
        className="absolute inset-0"
        style={{ touchAction: 'pan-x pan-y' }}
        onClick={toggleControls}
      >
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
        className={`pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-6 px-4 pt-8 transition-opacity duration-200  ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)',
        }}
      >
        <div className={`flex min-w-0 items-center gap-3 pb-4 md:gap-4 ${controlsVisible ? 'pointer-events-auto' : ''}`}>
          <IconButton
            variant="reader"
            className="shrink-0 backdrop-blur-md"
            onClick={onClose}
            aria-label="Back to library"
          >
            <ArrowLeftIcon />
          </IconButton>
          <span className="block truncate text-[13px] uppercase tracking-[0.08em] text-fg-muted">
            {book.title}
          </span>
        </div>

        <div className={`flex shrink-0 items-center gap-2 pb-4 md:gap-4 ${controlsVisible ? 'pointer-events-auto' : ''}`}>
          <IconButton
            variant="reader"
            className="backdrop-blur-md"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </IconButton>
          <IconButton
            variant="reader"
            className="backdrop-blur-md"
            onClick={() => setShowBookmarks((s) => !s)}
            aria-label="Bookmarks"
          >
            <BookmarkIcon />
          </IconButton>
        </div>
      </div>

      {/* Left side: warmth (vertical slider) */}
     {/* Left side: warmth */}
<div
  className={`absolute left-3 top-1/2 z-10 -translate-y-1/2 transition-opacity duration-200 ${sideVisibility}`}
>
  <div className="flex flex-col items-center gap-2 rounded-full bg-black/25 px-1.5 py-3 text-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.18)] backdrop-blur-md
                  max-[700px]:gap-1.5 max-[700px]:py-2"
  >
    <div className="scale-75 min-[700px]:scale-100">
      <ThermometerIcon />
    </div>

    <div className="relative h-24 w-6 min-[700px]:h-32 min-[700px]:w-8">
      <input
        type="range"
        min={0}
        max={100}
        value={temperature}
        onChange={(e) => setTemperature(Number(e.target.value))}
        aria-label="Warmth"
        className="absolute left-1/2 top-1/2 w-24 -translate-x-1/2 -translate-y-1/2 -rotate-90 accent-primary min-[700px]:w-32"
      />
    </div>
  </div>
</div>


{/* Right side: zoom */}
<div
  className={`absolute right-3 top-1/2 z-10 -translate-y-1/2 transition-opacity duration-200 ${sideVisibility}`}
>
  <div
    className="
      flex flex-col items-center gap-3 rounded-full
      bg-black/25 px-1.5 py-4 text-white/80
      shadow-[0_4px_16px_rgba(0,0,0,0.18)]
      backdrop-blur-md

      max-[700px]:gap-1.5
      max-[700px]:py-2
    "
  >
    <span title={`${Math.round(zoom * 100)}%`}>
      <div className="scale-75 min-[700px]:scale-100">
        <ZoomIcon />
      </div>
    </span>

    <div className="relative h-24 w-6 min-[700px]:h-32 min-[700px]:w-8">
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={zoomToSlider(zoom)}
        onChange={(e) => setZoom(sliderToZoom(Number(e.target.value)))}
        aria-label="Zoom"
        aria-valuetext={`${Math.round(zoom * 100)}%`}
        className="
          absolute left-1/2 top-1/2
          w-24
          -translate-x-1/2 -translate-y-1/2
          -rotate-90
          accent-primary
          min-[700px]:w-32
        "
      />
    </div>
  </div>
</div>


      {/* Bottom chrome — page indicator */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-6 pt-10 transition-opacity duration-200 md:pb-10 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)',
        }}
      >
        <div
          className={`flex items-center gap-1 rounded-full bg-black/25 p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.18)] backdrop-blur-md ${
            controlsVisible ? 'pointer-events-auto' : ''
          }`}
        >
          <IconButton
            variant="reader"
            onClick={prevPage}
            aria-label={isPdf ? 'Prev page' : 'Prev chapter'}
          >
            <ChevronLeftIcon />
          </IconButton>

          <div
            className="flex min-w-[104px] flex-col items-center gap-1 px-3 leading-none md:px-5"
            aria-live="polite"
          >
            <span className="font-display text-[18px] font-medium tabular-nums">
              {isPdf ? currentPage : ``}
            </span>
           
            <span className="mt-0.5 block h-[3px] w-full overflow-hidden rounded-full bg-white/25">
              <span
                className="block h-full rounded-full bg-white transition-[width] duration-200"
                style={{ width: `${progressPct}%` }}
              />
            </span>
          </div>

          <IconButton
            variant="reader"
            onClick={nextPage}
            aria-label={isPdf ? 'Next page' : 'Next chapter'}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>
      </div>

      {/* Bookmarks panel — direct child of the root so it sizes against the screen */}
      {showBookmarks && (
        <>
          <div
            className="absolute inset-0 z-20 bg-[#1a1a1a]/40 backdrop-blur-[12px]"
            onClick={() => setShowBookmarks(false)}
          />
          <aside
            className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 flex h-[85dvh] flex-col overflow-hidden rounded-t-[16px] bg-[#f7f4ef] shadow-[0_16px_40px_rgba(26,26,26,0.14)] md:inset-x-auto md:right-0 md:top-0 md:h-full md:w-[393px] md:rounded-none"
            onClick={(e) => e.stopPropagation()}
          >
            <BookmarkView
              bookId={book.id}
              currentPage={currentPage}
              currentCfi={currentCfi}
              onClose={() => setShowBookmarks(false)}
              onSelect={(bookmark: Bookmark) => {
                void goToBookmark(bookmark);
                setShowBookmarks(false);
              }}
            />
          </aside>
        </>
      )}
    </div>
  );
}
