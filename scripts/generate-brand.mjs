import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const brand = JSON.parse(readFileSync(resolve(root, 'src/brand/brand.json'), 'utf8'));
const {colors} = brand;
const escapeXml = value => String(value).replace(/[<>&"']/g, character => ({'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'}[character]));

// Embed the project's licensed fonts so exported SVGs need no external resources.
const fontData = (family, weight) => readFileSync(resolve(root, `node_modules/@fontsource/${family}/files/${family}-latin-${weight}-normal.woff2`)).toString('base64');
const fontSlug = name => name.toLowerCase().replace(/\s+/g, '-');
const displayFont = fontData(fontSlug(brand.fonts.display), 800);
const bodyFont = fontData(fontSlug(brand.fonts.body), 400);
const fontDefinitions = `<style>@font-face{font-family:BrandDisplay;src:url(data:font/woff2;base64,${displayFont}) format('woff2');font-weight:800}@font-face{font-family:BrandBody;src:url(data:font/woff2;base64,${bodyFont}) format('woff2');font-weight:400}</style>`;

// The E's three horizontal strokes sit beside a generous, open G.
const monogram = `<rect width="64" height="64" rx="18" fill="${colors.primary}"/><g fill="none" stroke="${colors.white}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M25 20H14V44H25M14 32H24"/><path d="M51 24A12 12 0 1 0 51 40V33H42"/></g>`;
const svg = (width, height, title, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img"><title>${escapeXml(title)}</title>${body}</svg>\n`;
const asset = (path, content) => {
  const output = resolve(root, 'public', path);
  mkdirSync(dirname(output), {recursive: true});
  writeFileSync(output, content);
  console.log(`Generated ${path}`);
};

asset(brand.assets.mark, svg(64, 64, `${brand.fullName} monogram`, monogram));

for (const inverse of [false, true]) {
  const wordColor = inverse ? colors.white : colors.navy;
  const dotColor = inverse ? colors.accent : colors.primary;
  const wordmark = `${fontDefinitions}${monogram}<text x="80" y="45" fill="${wordColor}" font-family="BrandDisplay,sans-serif" font-weight="800" font-size="39" letter-spacing="-2">${escapeXml(brand.name)}<tspan fill="${dotColor}">.</tspan></text>`;
  asset(inverse ? brand.assets.wordmarkInverse : brand.assets.wordmark, svg(264, 64, brand.fullName, wordmark));
}

const wrap = (text, length) => {
  const lines = [];
  for (const word of text.split(/\s+/)) {
    if (!lines.length || lines[lines.length - 1].length + word.length + 1 > length) lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
  }
  return lines;
};
const descriptionLines = wrap(brand.description, 62).slice(0, 3);
const taglineLines = brand.tagline.match(/[^.!?]+[.!?]?/g)?.map(line => line.trim()) ?? wrap(brand.tagline, 26);
const socialCard = `${fontDefinitions}
  <rect width="1200" height="630" fill="${colors.surface}"/>
  <rect x="854" width="346" height="630" fill="${colors.primary}"/>
  <path d="M854 0V630" stroke="${colors.white}" stroke-opacity=".2"/>
  <g transform="translate(70 56)">${monogram}<text x="82" y="45" fill="${colors.navy}" font-family="BrandDisplay,sans-serif" font-weight="800" font-size="39" letter-spacing="-2">${escapeXml(brand.name)}<tspan fill="${colors.primary}">.</tspan></text></g>
  <text x="72" y="193" fill="${colors.primary}" font-family="BrandBody,sans-serif" font-size="18" letter-spacing="2.4">${escapeXml(brand.fullName.toUpperCase())}</text>
  <text x="69" y="276" fill="${colors.navy}" font-family="BrandDisplay,sans-serif" font-weight="800" font-size="60" letter-spacing="-3">${taglineLines.map((line, index) => `<tspan x="69" dy="${index ? 76 : 0}">${escapeXml(line)}</tspan>`).join('')}</text>
  <text x="72" y="450" fill="${colors.muted}" font-family="BrandBody,sans-serif" font-size="21">${descriptionLines.map((line, index) => `<tspan x="72" dy="${index ? 31 : 0}">${escapeXml(line)}</tspan>`).join('')}</text>
  <rect x="72" y="548" width="52" height="4" rx="2" fill="${colors.primary}"/>
  <text x="140" y="557" fill="${colors.ink}" font-family="BrandBody,sans-serif" font-size="18">Engineering · Marketing · Speaking</text>
  <rect x="907" y="188" width="240" height="240" rx="72" fill="${colors.white}" fill-opacity=".1"/>
  <g transform="translate(931 212) scale(3)">${monogram}</g>
  <text x="1027" y="486" text-anchor="middle" fill="${colors.white}" font-family="BrandBody,sans-serif" font-size="18" letter-spacing="3">IDEAS INTO IMPACT</text>`;
asset(brand.assets.socialCard, svg(1200, 630, `${brand.fullName} — ${brand.tagline}`, socialCard));

asset(brand.assets.manifest ?? 'brand/site.webmanifest', `${JSON.stringify({
  name: brand.fullName,
  short_name: brand.name,
  description: brand.description,
  start_url: '../',
  scope: '../',
  display: 'standalone',
  theme_color: colors.primary,
  background_color: colors.white,
  icons: [{src: 'mark.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any'}],
}, null, 2)}\n`);

const fontLicenses = [...new Set([brand.fonts.display, brand.fonts.body])].map(family => {
  const slug = fontSlug(family);
  const license = readFileSync(resolve(root, `node_modules/@fontsource/${slug}/LICENSE`), 'utf8');
  return `${family} (@fontsource/${slug})\n\n${license}`;
}).join('\n\n---\n\n');
asset('brand/font-licenses.txt', `${fontLicenses}\n`);
