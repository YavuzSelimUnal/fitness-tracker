# Workout & Meal Tracker

A full-stack workout and nutrition tracker with an AI chat assistant — tell it what you ate or how you trained in plain English, and it logs it with real calorie data pulled from trusted nutrition and exercise-science sources (not guessed by the AI).

**Why I built this:** I wanted a gym/nutrition tracker that's actually mine — no subscription, no ads, and built the way I think about training. It's also a project to practice full-stack development and working with LLM tool-calling.

## Features

- Auth (signup/login)
- Log workouts (sets, reps, weight, or cardio duration/distance)
- Log meals with real nutrition data from USDA FoodData Central / Open Food Facts
- Progress charts (weight lifted over time, calorie trends)
- **AI chat**: message the app like "I had 2 eggs and went for a 30 min run" and it parses, looks up real data, calculates calories, and logs it automatically
- Installable as a PWA — add it to your phone's home screen

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, Recharts
- **Backend**: Node.js + Express, Prisma ORM
- **Database**: PostgreSQL
- **AI**: Claude API (tool use / function calling) for parsing natural language into structured log entries
- **External data**: USDA FoodData Central (nutrition), MET value table (exercise calorie burn)

## Security

This project was built with real-world security practices in mind, mapped here to relevant [OWASP Top 10](https://owasp.org/www-project-top-ten/) categories:

| Category | Implementation |
|---|---|
| **Broken Authentication** | Passwords hashed with bcrypt (never stored in plain text); JWT-based sessions; rate limiting on login/signup endpoints (10 attempts per 15 min per IP) to deter brute-force attacks |
| **Injection** | All request bodies validated with Zod schemas before touching the database; Prisma ORM uses parameterized queries throughout, eliminating raw SQL injection risk |
| **Broken Access Control** | Every edit/delete endpoint verifies the requesting user actually owns the resource before modifying it (e.g. a user cannot edit another user's meal log by guessing its ID) |
| **Security Misconfiguration** | `helmet` middleware sets standard protective HTTP headers; CORS is restricted to an explicit origin allowlist rather than accepting all origins; no secrets are ever committed to source control (enforced via `.gitignore` and environment variables) |
| **Vulnerable Components** | Dependencies are periodically checked with `npm audit` and updated when safe, non-breaking fixes are available |
| **Unrestricted File Upload** | Meal/progress photo uploads are restricted to a strict image MIME-type allowlist and a 10MB size limit; upload errors return clean responses instead of leaking internal error details |
| **Sensitive Data Exposure** | Error responses avoid leaking stack traces or internal implementation details to the client |
| **Rate Limiting / Abuse Prevention** | AI chat endpoints are rate-limited per authenticated user, both to prevent abuse and to control API cost exposure |

### Known tradeoffs

No system is without tradeoffs, and being explicit about them is part of good security practice:

- **Auth tokens are stored in `localStorage`, not httpOnly cookies.** This is simpler to implement and is a common choice for small/solo applications, but it does mean that in the event of an XSS vulnerability, a token could theoretically be read by malicious JavaScript. React's default output escaping mitigates this risk significantly (no `dangerouslySetInnerHTML` is used anywhere in this app), but a production system handling more sensitive data would likely use httpOnly cookies with CSRF protection instead.
- **AI-estimated data (photo-based calorie counts, custom exercise MET values) is approximate by design**, not a security issue, but worth noting: users can manually correct AI-generated estimates that seem inaccurate.

## Project Structure

```
workout-tracker/
├── server/          # Express API
│   ├── prisma/       # Database schema + migrations + seed data
│   └── src/
│       ├── routes/
│       ├── services/    # business logic (calorie calc, AI parsing, external API calls)
│       ├── middleware/
│       └── lib/
└── client/          # React app
    └── src/
        ├── components/
        ├── pages/
        ├── hooks/
        └── lib/
```

## Getting Started

See [`server/README.md`](server/README.md) and [`client/README.md`](client/README.md) for setup instructions for each half.

Quick start:

```bash
# 1. Clone and install
git clone <your-repo-url>
cd workout-tracker

# 2. Set up the database + backend
cd server
cp .env.example .env    # fill in your DATABASE_URL, JWT_SECRET, USDA_API_KEY, ANTHROPIC_API_KEY
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# 3. In a new terminal, set up the frontend
cd client
npm install
npm run dev
```

## Roadmap

- [x] Project scaffold + schema design
- [ ] Auth
- [ ] Workout logging
- [ ] Meal logging
- [ ] Dashboard + charts
- [ ] AI chat assistant
- [ ] PWA + deployment

## License

MIT
