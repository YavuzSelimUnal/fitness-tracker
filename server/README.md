# Server

Express + Prisma + PostgreSQL API.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Get a free Postgres database. Easiest options:
   - [Supabase](https://supabase.com) (free tier, includes auth/storage if you want them later)
   - [Neon](https://neon.tech) (free tier, serverless Postgres)
   - Or run Postgres locally with Docker:
     ```bash
     docker run --name workout-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
     ```

3. Copy the env file and fill in your values:
   ```bash
   cp .env.example .env
   ```
   You'll need:
   - `DATABASE_URL` — your Postgres connection string
   - `JWT_SECRET` — generate with `openssl rand -base64 32`
   - `USDA_API_KEY` — free, instant signup at https://fdc.nal.gov/api-key-signup
   - `ANTHROPIC_API_KEY` — from https://console.anthropic.com (needed once you build the AI chat feature)

4. Run migrations and seed the exercise table:
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```
   The API will run on http://localhost:4000. Check it's alive:
   ```bash
   curl http://localhost:4000/api/health
   ```

## What's implemented so far

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/exercises?search=` — search the seeded MET-value exercise table

## What's next (see root README roadmap)

- Workout logging routes (`/api/workouts`)
- Meal logging + USDA food search (`/api/meals`, `/api/foods/search`)
- Dashboard summary route
- AI chat endpoint with Claude tool use

## Useful commands

- `npx prisma studio` — visual database browser
- `npx prisma migrate dev` — run new migrations after editing `schema.prisma`
