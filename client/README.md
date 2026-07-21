# Client

React + Vite frontend, set up as an installable PWA.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your running backend
npm run dev
```

Runs on http://localhost:5173.

## What's implemented so far

- Signup / login pages, wired to the backend auth routes
- Auth state via `useAuth` hook (JWT stored in localStorage)
- Protected route wrapper — redirects to `/login` if not authenticated
- Placeholder dashboard

## What's next

- Workout logging form + history
- Meal logging form + food search
- Progress charts (Recharts)
- AI chat interface
- Add real icons at `public/icon-192.png` and `public/icon-512.png` for the PWA manifest (currently referenced but not included — needed before this is truly installable)

## Notes

- Tailwind is already configured — just use utility classes.
- The PWA plugin (`vite-plugin-pwa`) is set up in `vite.config.js`. Once you add real icons and run `npm run build`, it'll generate a service worker automatically.
