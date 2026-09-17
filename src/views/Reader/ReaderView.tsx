// src/views/Reader/ReaderView.tsx
import { useReaderViewModel } from '../../viewmodels/useReaderViewModel';
import { Book } from '../../services/BookService';
import { useEffect, useState } from 'react';

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
  const MAX_ZOOM = 3;

  const overlayOpacity = (temperature / 100) * 0.4; // cap at 40% so it never fully obscures content

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={onClose}>← Back</button>
        <button onClick={prevPage}>{isPdf ? '‹ Prev page' : '‹ Prev chapter'}</button>
        <button onClick={nextPage}>{isPdf ? 'Next page ›' : 'Next chapter ›'}</button>

        <button onClick={() => setZoom(Math.max(MIN_ZOOM, zoom - ZOOM_STEP))}>−</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.min(MAX_ZOOM, zoom + ZOOM_STEP))}>+</button>

        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>

        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          🌡️
          <input
            type="range"
            min={0}
            max={100}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
          />
        </label>
      </div>

      {loading && <div>Loading…</div>}

      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <div ref={attachContainer} style={{ width: '100%', height: '100%', overflow: 'auto' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundColor: `rgba(255, 158, 0, ${overlayOpacity})`,
            mixBlendMode: 'multiply',
          }}
        />
      </div>
    </div>
  );
}
