import {copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {setTimeout} from 'node:timers/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const brand = JSON.parse(readFileSync(resolve(root, 'src/brand/brand.json'), 'utf8'));
const windowsCandidates = [
  join(process.env.PROGRAMFILES ?? 'C:/Program Files', 'Google/Chrome/Application/chrome.exe'),
  join(process.env['PROGRAMFILES(X86)'] ?? 'C:/Program Files (x86)', 'Microsoft/Edge/Application/msedge.exe'),
  join(process.env.LOCALAPPDATA ?? '', 'Google/Chrome/Application/chrome.exe'),
];
const candidates = process.platform === 'win32' ? windowsCandidates : process.platform === 'darwin'
  ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge']
  : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/opt/google/chrome/chrome'];
const browser = process.env.CHROME_BIN || candidates.find(existsSync);
if (!browser) throw new Error('No Chromium browser found. Set CHROME_BIN to your Chrome, Chromium, or Edge executable.');

const source = resolve(root, 'public', brand.assets.socialCard);
const target = resolve(root, 'public', brand.assets.socialImage ?? 'brand/social-card.png');
if (!existsSync(source)) throw new Error('Run npm run brand:generate before exporting the social image.');
const profile = mkdtempSync(join(tmpdir(), 'godswill-brand-render-'));
const capture = join(profile, 'social-card.png');
try {
  const result = spawnSync(browser, [
    '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    '--window-size=1200,630', '--force-device-scale-factor=1', '--virtual-time-budget=1500',
    `--user-data-dir=${profile}`, `--screenshot=${capture}`, pathToFileURL(source).href,
  ], {encoding: 'utf8', windowsHide: true, timeout: 30_000});

  // Some browser launchers return before the isolated rendering process finishes.
  for (let attempt = 0; attempt < 20 && !existsSync(capture); attempt++) await setTimeout(250);
  if (!existsSync(capture)) {
    throw new Error(`Social image export failed (${result.error?.message ?? result.status}). ${result.stderr?.trim() ?? ''}`);
  }
  const bytes = readFileSync(capture);
  if (bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a' || bytes.readUInt32BE(16) !== 1200 || bytes.readUInt32BE(20) !== 630) {
    throw new Error('The exported social image must be a 1200 × 630 PNG.');
  }
  copyFileSync(capture, target);
  console.log(`Generated ${brand.assets.socialImage ?? 'brand/social-card.png'} (1200 × 630)`);
} finally {
  // Remove only the unique profile that this invocation created inside the OS temp directory.
  if (dirname(resolve(profile)) === resolve(tmpdir()) && profile.startsWith(join(tmpdir(), 'godswill-brand-render-'))) {
    rmSync(profile, {recursive: true, force: true, maxRetries: 3, retryDelay: 100});
  }
}
