
import { fetch } from '@tauri-apps/plugin-http';
import { openUrl } from '@tauri-apps/plugin-opener';
import { getVersion } from '@tauri-apps/api/app';

// TODO: fill in your repo details
const REPO_OWNER = 'bizkda';
const REPO_NAME = 'Ebook-reader';
const RELEASES_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes?: string;
  apkUrl?: string;
}

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  assets: GitHubAsset[];
}

/**
 * Compares two semver-like version strings (tolerates a leading "v" and
 * pre-release suffixes like "-beta.1", which are ignored for comparison).
 * Returns 1 if a > b, -1 if a < b, 0 if equal.
 */
function compareVersions(a: string, b: string): number {
  const clean = (v: string) => v.replace(/^v/i, '').split('-')[0];
  const pa = clean(a).split('.').map(Number);
  const pb = clean(b).split('.').map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na !== nb) return na > nb ? 1 : -1;
  }
  return 0;
}

/**
 * Fetches the latest GitHub release and compares it against the app's
 * currently installed version (from tauri.conf.json / Cargo.toml).
 */
export async function checkForUpdate(): Promise<UpdateInfo> {
  const currentVersion = await getVersion();

  const response = await fetch(RELEASES_API, {
    method: 'GET',
    headers: { Accept: 'application/vnd.github+json' },
  });

  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}`);
  }

  const release: GitHubRelease = await response.json();
  const latestVersion = release.tag_name;

  const apkAsset = release.assets.find((a) => a.name.toLowerCase().endsWith('.apk'));

  return {
    available: compareVersions(latestVersion, currentVersion) > 0,
    currentVersion,
    latestVersion,
    releaseNotes: release.body,
    apkUrl: apkAsset?.browser_download_url,
  };
}

/**
 * Opens the APK download URL in the system browser. Android will download
 * the file, then hand it to the package installer (the user needs to have
 * allowed "install unknown apps" for the browser once).
 */
export async function downloadUpdate(apkUrl: string): Promise<void> {
  await openUrl(apkUrl);
}
