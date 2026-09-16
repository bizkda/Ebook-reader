// src/services/FileSystemService.ts
import { open } from '@tauri-apps/plugin-dialog';
import { readFile, copyFile, mkdir, exists } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';

export async function pickBookFile(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    filters: [{ name: 'Books', extensions: ['epub', 'pdf'] }],
  });
  return typeof selected === 'string' ? selected : null;
}

export async function importBookFile(sourcePath: string): Promise<string> {
  const dataDir = await appDataDir();
  const booksDir = await join(dataDir, 'books');

  if (!(await exists(booksDir))) {
    await mkdir(booksDir, { recursive: true });
  }

  const fileName = sourcePath.split(/[\\/]/).pop()!;
  const destPath = await join(booksDir, fileName);

  await copyFile(sourcePath, destPath);
  return destPath;
}

export async function readBookBytes(filePath: string): Promise<Uint8Array> {
  return await readFile(filePath);
}