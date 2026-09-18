// src/viewmodels/useReaderViewModel.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PdfEngine } from '../services/readers/PdfEngine';
import { EpubEngine } from '../services/readers/EpubEngine';
import { ReaderEngine, ReaderLocation } from '../types/reader';
import { Book } from '../services/BookService';

export function useReaderViewModel(book: Book) {
const engineRef = useRef<ReaderEngine | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [location, setLocation] = useState<ReaderLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentClickTick, setContentClickTick] = useState(0);
  useEffect(() => {
  if (!container) return;
  const node = container; // freshly typed as HTMLElement, not narrowed-and-forgettable
  let cancelled = false;

  async function init() {
    const engine: ReaderEngine = book.format === 'pdf' ? new PdfEngine() : new EpubEngine();
    const saved = await invoke<{ current_page: number; current_cfi: string | null } | null>(
      'get_progress',
      { bookId: book.id }
    );
    if (cancelled) return;

    await engine.load(book.file_path, node);
    if (cancelled) {
      await engine.destroy();
      return;
    }
    engineRef.current = engine;
    engine.onContentClick?.(() => setContentClickTick((t) => t + 1));
    if (saved) {
      await engine.goToLocation({ page: saved.current_page, cfi: saved.current_cfi ?? undefined });
      if (cancelled) return;
    }

    engine.onLocationChange((loc) => {
      setLocation(loc);
      invoke('upsert_progress', {
        update: {
          book_id: book.id,
          current_page: loc.page,
          current_cfi: loc.cfi ?? null,
          percentage: loc.percentage,
        },
      });
    });

    setLoading(false);
  }

  setLoading(true);
  init();

  return () => {
    cancelled = true;
    engineRef.current?.destroy();
    engineRef.current = null;
  };
}, [book.id, container]);

  const attachContainer = useCallback((el: HTMLElement | null) => {
    setContainer(el);
  }, []);

  const [zoom, setZoomState] = useState(1.2);

  const setZoom = useCallback((scale: number) => {
  const engine = engineRef.current;
  if (engine instanceof PdfEngine) {
    engine.setZoom(scale);
    setZoomState(scale);
  } else if (engine instanceof EpubEngine) {
    engine.setZoom(scale);
    setZoomState(scale);
  }
}, []);

  const nextPage = useCallback(() => {
    void engineRef.current?.nextPage();
  }, []);

  const prevPage = useCallback(() => {
    void engineRef.current?.prevPage();
  }, []);
  const [darkMode, setDarkModeState] = useState(false);
  const setDarkMode = useCallback((enabled: boolean) => {
    engineRef.current?.setDarkMode(enabled);
    setDarkModeState(enabled);
  }, []);

  const [temperature, setTemperature] = useState(0); // 0–100, warmth only

  return {
  attachContainer, location, loading, zoom, setZoom, nextPage, prevPage,
  darkMode, setDarkMode, temperature, setTemperature, contentClickTick,
  isPdf: book.format === 'pdf', isEpub: book.format === 'epub'
}
}