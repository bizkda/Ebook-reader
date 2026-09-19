// src/services/readers/PdfEngine.ts
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { ReaderEngine, ReaderLocation } from '../../types/reader';
import { readFile } from '@tauri-apps/plugin-fs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const RENDER_WINDOW = 2; // pages to keep rendered on each side of viewport

export class PdfEngine implements ReaderEngine {
  private doc: PDFDocumentProxy | null = null;
  private container: HTMLElement | null = null;
  private pageWrappers: HTMLDivElement[] = [];
  private renderedPages = new Set<number>();
  private observer: IntersectionObserver | null = null;
  private currentPage = 1;
  private scale = 1.2;
  private locationCb: ((loc: ReaderLocation) => void) | null = null;

  async load(filePath: string, container: HTMLElement) {
    const bytes = await readFile(filePath);
    this.doc = await pdfjsLib.getDocument({ data: bytes }).promise;
    this.container = container;
    container.innerHTML = '';
    container.style.overflowY = 'auto';

    await this.buildPagePlaceholders();
    this.setupObserver();
  }

  private async buildPagePlaceholders() {
    if (!this.doc || !this.container) return;
    const refPageNum = Math.min(3, this.doc.numPages);
    const firstPage = await this.doc.getPage(refPageNum);
    const viewport = firstPage.getViewport({ scale: this.scale });

    for (let i = 1; i <= this.doc.numPages; i++) {
      const wrapper = document.createElement('div');
      wrapper.dataset.pageNum = String(i);
      wrapper.style.height = `${viewport.height}px`;
      wrapper.style.width = `${viewport.width}px`;
      wrapper.style.margin = '0 auto 8px';
      wrapper.style.position = 'relative';
      this.container.appendChild(wrapper);
      this.pageWrappers.push(wrapper);
    }
  }

  private setupObserver() {
    if (!this.container) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const pageNum = Number((entry.target as HTMLElement).dataset.pageNum);
          if (entry.isIntersecting) {
            this.renderWindow(pageNum);
          }
        }
        // Decide "current page" separately from render-triggering: pick the
        // entry with the greatest visible area rather than requiring 50%
        // visibility, since a zoomed page can be taller than the viewport
        // and would then never cross a 0.5 threshold.
        const mostVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (mostVisible) {
          const pageNum = Number((mostVisible.target as HTMLElement).dataset.pageNum);
          this.currentPage = pageNum;
          this.emitLocation();
        }
      },
      {
        root: this.container,
        // Any sliver of a page entering view should trigger a render — at
        // high zoom a page wrapper can be several times taller than the
        // container, so a 50% threshold can never be satisfied.
        threshold: 0,
        // Start rendering slightly before pages reach the viewport so
        // scrolling doesn't outrun the render window.
        rootMargin: '50% 0px 50% 0px',
      }
    );
    this.pageWrappers.forEach((el) => this.observer!.observe(el));
  }

  private async renderWindow(centerPage: number) {
    if (!this.doc) return;
    const lo = Math.max(1, centerPage - RENDER_WINDOW);
    const hi = Math.min(this.doc.numPages, centerPage + RENDER_WINDOW);

    for (let i = lo; i <= hi; i++) {
      if (!this.renderedPages.has(i)) await this.renderPage(i);
    }
    // free anything outside the window to keep memory flat
    for (const i of Array.from(this.renderedPages)) {
      if (i < lo || i > hi) this.clearPage(i);
    }
  }

  private async renderPage(pageNum: number) {
    if (!this.doc) return;
    const page: PDFPageProxy = await this.doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: this.scale });
    const wrapper = this.pageWrappers[pageNum - 1];

    const outputScale = window.devicePixelRatio || 1;

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    wrapper.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

    await page.render({ canvasContext: ctx, viewport, transform , canvas }).promise;
    this.renderedPages.add(pageNum);
  }

  private clearPage(pageNum: number) {
    const wrapper = this.pageWrappers[pageNum - 1];
    wrapper.innerHTML = '';
    this.renderedPages.delete(pageNum);
  }

  async setZoom(scale: number) {
    if (!this.doc || !this.container) return;
    this.scale = scale;
    this.renderedPages.clear();
    this.observer?.disconnect();
    this.container.innerHTML = '';
    this.pageWrappers = [];
    await this.buildPagePlaceholders();
    this.setupObserver();
    await this.goToLocation({ page: this.currentPage });
  }

  async goToLocation(loc: Partial<ReaderLocation>) {
    if (!loc.page) return;
    this.pageWrappers[loc.page - 1]?.scrollIntoView();
  }

  getCurrentLocation(): ReaderLocation {
    return {
      page: this.currentPage,
      percentage: this.doc ? this.currentPage / this.doc.numPages : 0,
    };
  }

  onLocationChange(cb: (loc: ReaderLocation) => void) {
    this.locationCb = cb;
  }

  private emitLocation() {
    this.locationCb?.(this.getCurrentLocation());
  }
  
  async setDarkMode(enabled: boolean) {
  if (!this.container) return;
  this.container.style.filter = enabled ? 'invert(0.9) hue-rotate(180deg)' : '';
}

  async nextPage() {
  if (!this.doc) return;
  const target = Math.min(this.doc.numPages, this.currentPage + 1);
  await this.goToLocation({ page: target });
}

  async prevPage() {
    const target = Math.max(1, this.currentPage - 1);
    await this.goToLocation({ page: target });
  }

  async destroy() {
  this.observer?.disconnect();
  try {
    await this.doc?.loadingTask.destroy();
  } catch (err) {
    console.error('PdfEngine teardown failed:', err);
  }
  this.renderedPages.clear();
  if (this.container) this.container.innerHTML = '';
}
}