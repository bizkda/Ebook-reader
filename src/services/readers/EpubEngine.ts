// src/services/readers/EpubEngine.ts
import ePub, { Book, Rendition } from 'epubjs';
import { ReaderEngine, ReaderLocation } from '../../types/reader';
import { readFile } from '@tauri-apps/plugin-fs';

export class EpubEngine implements ReaderEngine {
  private book: Book | null = null;
  private rendition: Rendition | null = null;
  private locationCb: ((loc: ReaderLocation) => void) | null = null;
  private contentClickCb: (() => void) | null = null; // add this

  async load(filePath: string, container: HTMLElement) {
    const bytes = await readFile(filePath);
    this.book = ePub(bytes.buffer);
    this.rendition = this.book.renderTo(container, {
      width: '100%',
      height: '100%',
      flow: 'scrolled-doc',
      allowScriptedContent: true, // adds allow-scripts to the iframe sandbox

    });
    await this.rendition.display();

    this.rendition.on('relocated', (location: any) => {
      this.locationCb?.({
        page: location.start.displayed.page,
        cfi: location.start.cfi,
        percentage: location.start.percentage ?? 0,
      });
    });

    // forward clicks inside the content iframe to the outside world
    this.rendition.on('click', () => {
      this.contentClickCb?.();
    });
  }

  onContentClick(cb: () => void) {
    this.contentClickCb = cb;
  }
// nextPage/prevPage unchanged — rendition.next()/.prev() now advance by chapter, not page

  async goToLocation(loc: Partial<ReaderLocation>) {
    if (loc.cfi) await this.rendition?.display(loc.cfi);
  }

  getCurrentLocation(): ReaderLocation {
    const loc = this.rendition?.currentLocation() as any;
    return {
      page: loc?.start?.displayed?.page ?? 0,
      cfi: loc?.start?.cfi,
      percentage: loc?.start?.percentage ?? 0,
    };
  }
  async setDarkMode(enabled: boolean) {
  if (!this.rendition) return;
  this.rendition.themes.register('dark', {
    body: { background: '#1a1a1a !important', color: '#d4d4d4 !important' },
    'p, div, span, li, h1, h2, h3, h4, h5, h6': { color: '#d4d4d4 !important' },
    a: { color: '#8ab4f8 !important' },
  });
  this.rendition.themes.register('light', {});
  this.rendition.themes.select(enabled ? 'dark' : 'light');
}

  onLocationChange(cb: (loc: ReaderLocation) => void) {
    this.locationCb = cb;
  }
  async setZoom(scale: number) {
  this.rendition?.themes.fontSize(`${Math.round(scale * 100)}%`);
}
  async nextPage() {
  await this.rendition?.next();
}

  async prevPage() {
    await this.rendition?.prev();
  }

  async destroy() {
    this.rendition?.destroy();
    this.book?.destroy();
  }
  

}