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

1. Replace and optimise the original profile photograph if desired. Currently reuses the original GitHub profile image via its raw URL.
2. Verify public case studies, achievements, project ownership, screenshots and links.
3. Replace blog editorial drafts with approved, dated posts; add genuine upcoming event entries.
4. Set the booking provider URL and test real availability, timezone and confirmation emails.
5. Configure email and domain, test accessibility and conduct a mobile QA pass.

## Deployment

App uses `HashRouter` so nested routes also work on GitHub Pages without server rewrites. For GitHub Pages at `DONNWILZY/my_profile`, build with `GITHUB_PAGES=true npm run build` and publish `dist/`. On custom hosting, use the default build. Configure environment variables at build time.

Legacy `my profile/` Bootstrap files are preserved on this feature branch for reference. This Vite project runs from the repository root.
