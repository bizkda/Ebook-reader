// src/types/reader.ts
export interface ReaderLocation {
  page: number;
  cfi?: string;        // epub only
  percentage: number;
}

export interface ReaderEngine {
  load(filePath: string, container: HTMLElement): Promise<void>;
  goToLocation(loc: Partial<ReaderLocation>): Promise<void>;
  getCurrentLocation(): ReaderLocation;
  onLocationChange(cb: (loc: ReaderLocation) => void): void;
  destroy(): void;
}