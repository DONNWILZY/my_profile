# Godswill brand system

The identity is **Godswill**, the personal brand of **Effiong Godswill**. The EG monogram pairs a geometric E and open G in a royal-blue square. It carries no decorative arrows or AI symbols.

**Tagline:** Build with purpose. Grow with intention.

**Description:** Effiong Godswill is a software engineer, digital marketing strategist, and public speaker connecting technology, storytelling, and business growth.

## One configuration

Edit `src/brand/brand.json` for names, descriptions, location, social profiles, hero copy, account copy, page titles, colors, and typography. Keep the descriptive prose in sync when changing the identity.

The header, footer, login, signup, introduction, hero, image descriptions, and page metadata read this configuration. `src/data.ts` re-exports its social profiles for existing screens. `PageMetadata` updates titles and descriptions on navigation, including article titles.

Vite injects the configuration into the initial HTML and creates CSS variables before the app loads. Shared CSS and Tailwind use the same variables. `royal`, `navy`, `ink`, and the other Tailwind aliases support opacity modifiers.

| Role | Color |
| --- | --- |
| Primary / royal blue | `#4169E1` |
| Primary hover | `#3054C1` |
| Navy | `#0A1F44` |
| Main text | `#20334C` |
| Secondary text | `#6A7A91` |
| Light surface | `#F4F7FF` |
| Blue tint | `#E7EFFB` |
| Border | `#DFE6EF` |
| Accent blue | `#8BC8FF` |

DM Sans is the body typeface; Manrope is the display and wordmark typeface. Both are bundled locally. If changing fonts, install the matching Fontsource packages and update the font imports in `src/styles.css`.

## Reuse the logo

```tsx
import {brand} from './brand';
import BrandLogo from './components/BrandLogo';

<Link to="/" aria-label={`${brand.fullName} home`}>
  <BrandLogo />
</Link>
```

Use `variant="inverse"` on dark backgrounds and `markOnly` for small spaces. Set `--brand-logo-size` on the wrapper to resize it. The enclosing link must provide the accessible name. Give the logo clear space of at least a quarter of its height, keep the proportions intact, and use the supplied inverse version on dark surfaces. The EG artwork is bespoke; changing the initials requires updating its paths in the generator.

## Exported assets

Assets live in `public/brand/`:

- `mark.svg`: monogram and browser favicon.
- `wordmark.svg`: logo for light backgrounds.
- `wordmark-inverse.svg`: logo for dark backgrounds.
- `social-card.svg`: editable, self-contained 1200 by 630 sharing artwork.
- `social-card.png`: raster sharing image for Open Graph and Twitter cards.
- `site.webmanifest`: app name, icon, and theme color.

`npm run brand:generate` regenerates vector assets and the manifest. It also runs automatically before development and production builds. Exported artwork embeds the bundled fonts and does not request external fonts.

After changing brand copy or colors, run `npm run brand:render` to refresh the PNG too. Rendering requires Chrome, Chromium, or Edge; set `CHROME_BIN` if the renderer cannot locate your browser. The renderer runs headlessly and uses a temporary browser profile.

For deployment, set `VITE_SITE_URL` to the full public site URL, including any subdirectory, to create an absolute social-image URL. Without it, assets use the Vite base path. The app uses hash routing, so social previews of individual hash routes share the initial homepage metadata; crawlers generally do not execute the route-specific metadata updates.

Use direct, practical language. Describe real work and specific outcomes. Avoid invented metrics, hype, and decorative icons. Project and photography colors can retain their own palettes.
