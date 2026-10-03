import * as pdfjs from 'pdfjs-dist';
import ePub from 'epubjs';
import { readFile, writeFile, mkdir, exists } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';
import type { Book } from './BookService';

const COVER_WIDTH = 400; // px: sharp enough for thumbnails, small enough to load fast

async function saveCanvas(canvas: HTMLCanvasElement, bookId: string): Promise<string | null> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.85),
  );
  if (!blob) return null;

  const dir = await join(await appDataDir(), 'covers');
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  const outPath = await join(dir, `${bookId}.jpg`);
  await writeFile(outPath, new Uint8Array(await blob.arrayBuffer()));
  return outPath;
}

async function pdfCover(book: Book): Promise<string | null> {
  let loadingTask: ReturnType<typeof pdfjs.getDocument> | null = null;
  try {
    const data = await readFile(book.file_path);
    loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: COVER_WIDTH / base.width });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff'; // PDF pages are often transparent
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: ctx, viewport }).promise; // match your pdfjs version

    return await saveCanvas(canvas, book.id);
  } finally {
    await loadingTask?.destroy();
  }
}

async function epubCover(book: Book): Promise<string | null> {
  const data = await readFile(book.file_path);
  const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const epub = ePub(buffer as ArrayBuffer);
  try {
    await epub.ready;
    const url = await epub.coverUrl();
    if (!url) return null; // no cover in this EPUB

    const blob = await (await fetch(url)).blob();
    const bitmap = await createImageBitmap(blob);

    // Shrink big publisher covers (often 2000px+) down to thumbnail size
    const scale = Math.min(1, COVER_WIDTH / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    return await saveCanvas(canvas, book.id);
  } finally {
    epub.destroy();
  }
}

/** Returns the saved cover path, or null if none could be made. */
export async function generateCover(book: Book): Promise<string | null> {
  try {
    return book.format === 'pdf' ? await pdfCover(book) : await epubCover(book);
  } catch (err) {
    console.error('Failed to generate cover', err);
    return null;
  }
}