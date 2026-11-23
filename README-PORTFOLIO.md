# Effiong Godswill — royal-blue portfolio

Modern multi-page personal portfolio built with **React, Vite, TypeScript, Tailwind CSS, GSAP and Framer Motion**.

## Running locally

```bash
npm install
npm run dev
npm run build
```

## Site structure

- Home, About, Engineering, Marketing, Portfolio Explorer, Speaking, Blog, Events, Booking and Contact.
- Filterable, searchable project gallery with verified public project links.
- Mobile navigation, subtle entrance animations, reduced-motion support, responsive layouts and accessible labels.
- Blog article routes and events are presently **curated local TypeScript content**, not a CMS. Editorial draft labels are intentional.
- **Booking is not live by default.** The calendar provides date browsing but *never claims that selected dates are available*. Set `VITE_BOOKING_URL` to a real Cal.com/Calendly scheduling page for actual availability, conflict checks and confirmed booking. Ensure each enquiry type has an appropriate event link in the scheduling provider.
- Set `VITE_CONTACT_EMAIL` to activate email links.

## Content to review before going live

1. Replace and optimise the original profile photograph if desired. Portraits are bundled from the local images directory.
2. Verify public case studies, achievements, project ownership, screenshots and links.
3. Replace blog editorial drafts with approved, dated posts; add genuine upcoming event entries.
4. Set the booking provider URL and test real availability, timezone and confirmation emails.
5. Configure email and domain, test accessibility and conduct a mobile QA pass.

## Deployment

App uses `HashRouter` so nested routes also work on GitHub Pages without server rewrites. For GitHub Pages at `DONNWILZY/my_profile`, build with `GITHUB_PAGES=true npm run build` and publish `dist/`. On custom hosting, use the default build. Configure environment variables at build time.

Legacy `my profile/` Bootstrap files are preserved on this feature branch for reference. This Vite project runs from the repository root.

## Navigation and future accounts

Shared navigation lives in `src/components/Header.tsx`, with styles in `src/components/navigation.css`. Services and Insights group related pages; the mobile navigation supports Escape, outside clicks, route changes, and viewport changes.

`/login` and `/signup` render `src/components/AuthPage.tsx`. These are UI previews with disabled submission: no credentials are sent or stored, and no accounts or sessions are created. Connect an authentication provider and implement server-side session handling, verification, and password recovery before enabling account access.

The homepage hero is in `src/components/Hero.tsx` and `src/components/hero.css`. Its animated photo stack uses the two local photographs in `my profile/images`, with a repeated crop for the third card. Replace entries in `photographs` to add more photos. Animation can be paused and respects reduced-motion preferences. Sign up is linked from the login page only.

## Shared branding

Identity, messaging, colors, social links, and page metadata live in `src/brand/brand.json`. See [BRANDING.md](BRANDING.md) for the logo variants, generated assets, and usage. `npm run brand:generate` refreshes SVGs and the app manifest; `npm run brand:render` also exports the social PNG. Both development and builds regenerate the vector assets automatically.

## Discipline portfolios

`/engineering` and `/marketing` now use the video-inspired portfolio layout in `src/components/DisciplinePortfolio.tsx`, with separate content in `src/portfolioData.ts`. The pages reuse the shared brand palette, navigation, and logos. Project visuals are illustrative, and marketing presents three connected focus areas within GleegX Media rather than inventing additional clients or results.

The project form prepares a brief locally. Visitors can download it and choose a contact method; when `VITE_CONTACT_EMAIL` is set, they can open a prefilled email. The form does not send messages or claim server-side delivery.

## Project collections and expanded details

Each discipline portfolio keeps three featured cards. `View all projects` opens `/engineering/projects` or `/marketing/projects`; selecting any card opens `/<discipline>/projects/<slug>`. Collections include featured and additional work, with search, Featured/More work filters, and preserved filters when returning from a detail page. The general `/portfolio` and homepage project links also open internal details first.

`src/projectCatalog.ts` holds the case-study catalog, featured selection, scope, approach, parent relationships, and route helpers. `src/data.ts` holds the six original project records and their stable slugs. Engineering currently has five projects; marketing includes GleegX Media and three explicitly labeled focus studies within that project. Add genuine projects to the source records and catalog rather than duplicating cards in the page components.

Expanded pages include context, scope, approach, focus areas, external resources, related work from the same discipline, and a project-not-found state for invalid slugs. `src/components/ProjectPages.tsx` renders collections and details; `ProjectVisual.tsx` reuses the illustrative previews. Existing HashRouter deployment means browser links include `#/engineering/projects/...` or `#/marketing/projects/...`.

## Courses, cohorts, and digital products

`/courses` replaces Training in the navigation; `/training` redirects to it. The catalog supports search and individual/cohort filters, with the filter state retained when returning from details. `/courses/:slug` shows an individual course; `/courses/cohorts/:slug` shows a batch training offering. `src/courseCatalog.ts` holds the proposed outlines, audiences, prerequisites, and related formats. These are upcoming offerings: dates, delivery arrangements, and fees must be confirmed before enrollment opens. No payment or enrollment is simulated.

`/digital-products` lists platforms and downloadable resources. `/digital-products/:slug` expands the product's purpose, features, and access information. Edit `src/digitalProductsData.ts` to manage the collection. The planning worksheet is an actual editable Markdown download in `public/resources/`. Asset links use the Vite base path so downloads also work on GitHub Pages.

`src/components/Courses.tsx` and `DigitalProducts.tsx` share the blue brand styling in `offerings.css`. Both have missing-item states and dynamic page metadata. Course and product enquiry links prefill `ContactPage.tsx` through `topic` and `item` query parameters. Visitors can edit and copy their enquiry locally, or open an email app when `VITE_CONTACT_EMAIL` is configured. Messages are not submitted to a server.
