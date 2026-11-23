import {copyFile} from 'node:fs/promises';

// GitHub Pages serves this document for direct links to client-side routes.
// Hosts with SPA rewrites and the bundled Node server return index.html directly.
if (process.env.GITHUB_PAGES === 'true') {
  await copyFile(new URL('../dist/index.html', import.meta.url), new URL('../dist/404.html', import.meta.url));
}
