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
