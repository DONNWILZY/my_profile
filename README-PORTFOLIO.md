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
- Booking uses the shared Node scheduling API. `npm run dev` starts both the frontend and API. Taken or overlapping times are disabled, and the server rechecks every reservation.
- Set `VITE_CONTACT_EMAIL` to activate email links.

## Content to review before going live

1. Replace and optimise the original profile photograph if desired. Portraits are bundled from the local images directory.
2. Verify public case studies, achievements, project ownership, screenshots and links.
3. Replace blog editorial drafts with approved, dated posts; add genuine upcoming event entries.
4. Deploy the shared booking API with durable storage and test availability, timezone, cancellation, and rescheduling. Meeting links and email notifications are arranged separately.
5. Configure email and domain, test accessibility and conduct a mobile QA pass.

## Deployment

The app uses `BrowserRouter` with standard paths such as `/speaking`, `/courses`, and `/dashboard/bookings`. Existing `#/...` links are converted to clean paths on arrival. Query parameters remain available for filters and prefilled enquiries.

For the bundled Node server, use the default `npm run build` and `npm start`; it serves `index.html` for frontend routes so direct links and refreshes work. Static hosting must rewrite frontend routes to `index.html` while keeping `/api/*` routed to the booking API. `public/_redirects` supplies the SPA rewrite for hosts that support that format. On other servers, configure the equivalent fallback.

For GitHub Pages at `DONNWILZY/my_profile`, set `GITHUB_PAGES=true` when running `npm run build` and publish `dist/`. The router uses the `/my_profile/` base and the build includes `404.html` for direct route loading. GitHub Pages returns HTTP 404 for those deep-link requests even though the app renders; hosting with SPA rewrites is preferable for HTTP 200 responses. Configure environment variables at build time.

Legacy `my profile/` Bootstrap files are preserved on this feature branch for reference. This Vite project runs from the repository root.

Run `npm run test:routing` to verify that direct frontend URLs return the app while API and missing asset requests retain their own responses.

## Navigation and future accounts

Shared navigation lives in `src/components/Header.tsx`, with styles in `src/components/navigation.css`. Services and Insights group related pages; the mobile navigation supports Escape, outside clicks, route changes, and viewport changes.

`/login` and `/signup` render `src/components/AuthPage.tsx`. These are UI previews with disabled submission: no credentials are sent or stored, and no accounts or sessions are created. Connect an authentication provider and implement server-side session handling, verification, and password recovery before enabling account access.

The homepage hero is in `src/components/Hero.tsx` and `src/components/hero.css`. Its animated photo stack uses the two local photographs in `my profile/images`, with a repeated crop for the third card. Replace entries in `photographs` to add more photos. Animation can be paused and respects reduced-motion preferences. Sign up is linked from the login page only.

## Shared branding

Identity, messaging, colors, social links, and page metadata live in `src/brand/brand.json`. See [BRANDING.md](BRANDING.md) for the logo variants, generated assets, and usage. `npm run brand:generate` refreshes SVGs and the app manifest; `npm run brand:render` also exports the social PNG. Both development and builds regenerate the vector assets automatically.

## Speaking

`/speaking` uses `src/components/SpeakingPage.tsx` and `speaking-page.css`. The reference-inspired composition includes a centered introduction, a staggered photo collage, proposed conversation topics, the Google I/O Extended 2023 appearance, and expandable session formats. The page uses the shared navigation, footer, colors, and portrait assets. Speaking invitations open the booking page with the correct appointment type; topic and format enquiries prefill the contact page. Proposed topics are not presented as past talks or available recordings.

## Discipline portfolios

`/engineering` and `/marketing` now use the video-inspired portfolio layout in `src/components/DisciplinePortfolio.tsx`, with separate content in `src/portfolioData.ts`. The pages reuse the shared brand palette, navigation, and logos. Project visuals are illustrative, and marketing presents three connected focus areas within GleegX Media rather than inventing additional clients or results.

The project form prepares a brief locally. Visitors can download it and choose a contact method; when `VITE_CONTACT_EMAIL` is set, they can open a prefilled email. The form does not send messages or claim server-side delivery.

## Project collections and expanded details

Each discipline portfolio keeps three featured cards. `View all projects` opens `/engineering/projects` or `/marketing/projects`; selecting any card opens `/<discipline>/projects/<slug>`. Collections include featured and additional work, with search, Featured/More work filters, and preserved filters when returning from a detail page. The general `/portfolio` and homepage project links also open internal details first.

`src/projectCatalog.ts` holds the case-study catalog, featured selection, scope, approach, parent relationships, and route helpers. `src/data.ts` holds the six original project records and their stable slugs. Engineering currently has five projects; marketing includes GleegX Media and three explicitly labeled focus studies within that project. Add genuine projects to the source records and catalog rather than duplicating cards in the page components.

Expanded pages include context, scope, approach, focus areas, external resources, related work from the same discipline, and a project-not-found state for invalid slugs. `src/components/ProjectPages.tsx` renders collections and details; `ProjectVisual.tsx` reuses the illustrative previews. Browser links use `/engineering/projects/...` or `/marketing/projects/...`.

## Courses, cohorts, and digital products

`/courses` replaces Training in the navigation; `/training` redirects to it. The catalog supports search and individual/cohort filters, with the filter state retained when returning from details. `/courses/:slug` shows an individual course; `/courses/cohorts/:slug` shows a batch training offering. `src/courseCatalog.ts` holds the proposed outlines, audiences, prerequisites, and related formats. These are upcoming offerings: dates, delivery arrangements, and fees must be confirmed before enrollment opens. No payment or enrollment is simulated.

`/digital-products` lists platforms and downloadable resources. `/digital-products/:slug` expands the product's purpose, features, and access information. Edit `src/digitalProductsData.ts` to manage the collection. The planning worksheet is an actual editable Markdown download in `public/resources/`. Asset links use the Vite base path so downloads also work on GitHub Pages.

`src/components/Courses.tsx` uses `course-learning.css` and `CourseCover.tsx` for the reference-inspired learning catalog and course details. Digital Products uses `offerings.css`. Both follow the shared blue brand palette. Both have missing-item states and dynamic page metadata. Course and product enquiry links prefill `ContactPage.tsx` through `topic` and `item` query parameters. Visitors can edit and copy their enquiry locally, or open an email app when `VITE_CONTACT_EMAIL` is configured. Messages are not submitted to a server.

## Platform dashboard

`/dashboard` brings together activity from across the platform: appointments, saved
projects, courses, articles, events, resources, offers, and prepared enquiries.
`/dashboard/activity`, `/dashboard/saved`, and `/dashboard/enquiries` expand the
platform overview. Public save buttons and enquiry preparation update the same
validated, versioned browser state in `godswill.dashboard.v1`. Existing saved course
plans and notes migrate without being discarded. Account login remains a disabled
preview; saved items are local to this browser, with cross-tab synchronization.

Course progress records personal review of upcoming course outlines, not enrollment
or certification. Confirmed appointments are managed separately by the shared API.
Resetting dashboard preferences and saved items does not cancel appointments.

Every route, including dashboard pages, renders the same homepage footer from
`Footer.tsx`. Engineering, marketing, their project collections, and detail pages
use white surfaces with navy text and blue accents.

## Shared booking and schedule

`npm run dev` starts Vite and the booking API (127.0.0.1:8787). `/book` and
`/dashboard/bookings` share `src/scheduling/SchedulePage.tsx`: month, week, and agenda
views, occupied-date circles, disabled taken times, a contact form, confirmed
appointment records, cancellation, and rescheduling. Times are Africa/Lagos (UTC+1),
Monday-Friday 09:00-17:00, on a 30-minute grid, with two hours of lead time and a
90-day booking horizon. Service durations vary from 30 to 60 minutes.

The server in `server/schedule-server.mjs` rechecks time ranges across all service
types and saves atomically before confirming. Competing or overlapping reservations
return HTTP 409; the UI refreshes availability. Unavailable or unreadable storage
fails closed. Public availability contains only occupied date/time ranges, never
names or email addresses. Private management tokens authorize appointment lookup,
cancellation, and rescheduling; only token hashes are stored by the server.

Run `npm run test:schedule` for the backend tests. They cover concurrent requests,
interval overlap, persistence, validation, token access, rescheduling, cancellation,
corrupt storage, request bounds, and protection of private files.

For production on a Node host, run `npm run build` then `npm start`. Keep exactly
one booking process per data file on a durable private disk. `SCHEDULE_DATA_FILE`
changes the default `data/appointments.json` location; the local `data/` directory
is ignored by Git. Configure a deliberate retention and backup policy for the
contact details that bookings store. This file store is intended for a single Node
instance; a horizontally scaled deployment requires a shared transactional database.

GitHub Pages and other static hosts cannot run the booking server. Deploy it on a
Node host and set `VITE_SCHEDULE_API_URL` to its public origin before building the
frontend. Allow the frontend origin through `SCHEDULE_ALLOWED_ORIGINS` on that
server. The frontend disables booking when it cannot verify live availability.
No credentials or management tokens belong in Vite environment variables.
