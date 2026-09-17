// src/services/FileSystemService.ts
import { open } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile, mkdir, exists } from '@tauri-apps/plugin-fs';
import { appDataDir, join, basename, extname } from '@tauri-apps/api/path';

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

  // basename/extname resolve content:// URIs on Android via the platform's
  // content resolver, unlike manual string splitting.
  const name = await basename(sourcePath);
  const ext = (await extname(sourcePath)) || undefined;
  const fileName = ext && !name.toLowerCase().endsWith(`.${ext.toLowerCase()}`)
    ? `${name}.${ext}`
    : name;

  const destPath = await join(booksDir, fileName);

  // copyFile requires both sides to resolve to real filesystem paths; on
  // Android the picked file is a content:// URI (FilePath::Url), which
  // copyFile rejects with "URL is not a valid path". readFile *does*
  // support content:// sources, so read + write manually instead.
  const bytes = await readFile(sourcePath);
  await writeFile(destPath, bytes);

  return destPath;
}

export async function readBookBytes(filePath: string): Promise<Uint8Array> {
  return await readFile(filePath);
}