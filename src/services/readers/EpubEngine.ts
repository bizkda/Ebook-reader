// src/services/readers/EpubEngine.ts
import ePub, { Book, Rendition } from 'epubjs';
import { ReaderEngine, ReaderLocation } from '../../types/reader';

export class EpubEngine implements ReaderEngine {
  private book: Book | null = null;
  private rendition: Rendition | null = null;
  private locationCb: ((loc: ReaderLocation) => void) | null = null;

  async load(filePath: string, container: HTMLElement) {
    this.book = ePub(filePath);
    this.rendition = this.book.renderTo(container, {
      width: '100%',
      height: '100%',
      flow: 'paginated',
    });
    await this.rendition.display();

    this.rendition.on('relocated', (location: any) => {
      this.locationCb?.({
        page: location.start.displayed.page,
        cfi: location.start.cfi,
        percentage: location.start.percentage ?? 0,
      });
    });
  }

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

  onLocationChange(cb: (loc: ReaderLocation) => void) {
    this.locationCb = cb;
  }

  destroy() {
    this.rendition?.destroy();
    this.book?.destroy();
  }
}