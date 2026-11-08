# Vite + vanilla TypeScript portfolio

**No React or TSX:** Vite, Tailwind CSS, TypeScript, Lucide, GSAP, Motion vanilla JavaScript animation API.

Framer Motion's React components require React. For this React-free site, use `motion`'s vanilla JS APIs (`animate`, `inView`).

## Run

```bash
npm install
npm run dev
npm run build
```

Site routes are authored in `src/main.ts` and content in `src/data.ts`. One minimal `index.html` bootstraps Vite. GitHub Pages uses hash routes. Blog entries are editorial drafts. Booking is not live until `VITE_BOOKING_URL` points to an actual provider with confirmed availability. Optional: `VITE_CONTACT_EMAIL` for direct enquiries.

Legacy `my profile/` Bootstrap files are preserved for reference; they are not loaded by the Vite app.
