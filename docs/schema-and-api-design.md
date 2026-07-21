# Workout & Meal Tracker — Schema + API Design

## 1. Database Schema (PostgreSQL)

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| email | text, unique | |
| password_hash | text | skip if using Supabase Auth |
| name | text | |
| weight_kg | numeric | **needed for accurate calorie-burn calc** |
| height_cm | numeric | |
| sex | text | 'male' / 'female' / 'other' — affects BMR formulas |
| date_of_birth | date | for age-based BMR |
| created_at | timestamptz | |

> Weight changes over time, so also keep a `weight_logs` table (below) — always use the *most recent* weight logged before a given workout date for calorie-burn accuracy, not just the profile's current weight.

### `weight_logs`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| weight_kg | numeric | |
| logged_at | timestamptz | |

### `exercises` (reference table, seeded once)
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| name | text | e.g. "Running", "Bench Press" |
| category | text | cardio / strength / mobility |
| met_value | numeric | Metabolic Equivalent of Task — used for cardio calorie calc |
| is_custom | boolean | true if user-added |
| created_by | UUID (FK → users, nullable) | null for seeded system exercises |

> Seed this table from the **Compendium of Physical Activities** (the standard academic MET reference — publicly available, widely cited in exercise science, used by fitness researchers and most fitness apps under the hood). For strength training (not MET-friendly), see calorie calc method below.

### `workout_sessions`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| date | date | |
| notes | text | optional |
| created_at | timestamptz | |

### `workout_entries`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| session_id | UUID (FK → workout_sessions) | |
| exercise_id | UUID (FK → exercises) | |
| sets | int | nullable, for strength |
| reps | int | nullable, for strength |
| weight_kg | numeric | nullable, for strength |
| duration_min | numeric | nullable, for cardio |
| distance_km | numeric | nullable, for cardio |
| calories_burned | numeric | **calculated and stored**, not recalculated every read |

### `food_items` (cache table — avoids re-hitting external API for the same food)
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| external_id | text | ID from USDA/Open Food Facts |
| source | text | 'usda' / 'openfoodfacts' |
| name | text | |
| calories_per_100g | numeric | |
| protein_per_100g | numeric | |
| carbs_per_100g | numeric | |
| fat_per_100g | numeric | |
| cached_at | timestamptz | refresh occasionally |

### `meal_logs`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| date | date | |
| meal_type | text | breakfast/lunch/dinner/snack |
| created_at | timestamptz | |

### `meal_entries`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| meal_log_id | UUID (FK → meal_logs) | |
| food_item_id | UUID (FK → food_items) | |
| quantity_g | numeric | normalized to grams for consistent math |
| calories | numeric | calculated: quantity_g/100 * calories_per_100g |

### `chat_messages`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| role | text | 'user' / 'assistant' |
| content | text | raw message text |
| structured_data | jsonb | nullable — the parsed tool-call output, for debugging/audit |
| created_at | timestamptz | |

---

## 2. Calorie-Burn Calculation Method (genuinely accurate approach)

**Cardio (MET-based):**
```
calories_burned = MET_value * weight_kg * duration_hours
```
This is the formula used across exercise science literature and most reputable fitness apps. Example: running at MET 9.8, 70kg person, 30 min → `9.8 * 70 * 0.5 = 343 kcal`.

**Strength training:**
MET values are unreliable for strength work because effort varies wildly by intensity. Two solid options:
- Use a strength-specific MET (e.g., "resistance training, vigorous" ≈ MET 6.0) as a reasonable estimate, OR
- Use the more precise **volume-based method**: total weight moved (sets × reps × weight) as a secondary metric shown alongside a MET-based estimate, so the user sees both "effort volume" and "estimated calories" rather than treating the calorie number as gospel.

Be transparent in your README/UI: strength-training calorie burn is inherently an estimate — even lab equipment (VO2 max testing) is the only "true" measurement. This is exactly the kind of nuance that impresses in an interview if asked about it.

**Meals (direct from nutrition DB):**
```
calories = (quantity_g / 100) * calories_per_100g
```
Pulled straight from USDA FoodData Central or Open Food Facts — no estimation needed, these are lab-tested values.

---

## 3. API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Profile
- `GET /api/users/me`
- `PATCH /api/users/me`
- `POST /api/users/me/weight` — log new weight entry

### Workouts
- `GET /api/workouts?from=&to=` — history, date range
- `POST /api/workouts` — create session + entries
- `GET /api/workouts/:id`
- `DELETE /api/workouts/:id`
- `GET /api/exercises?search=` — search exercise reference table
- `POST /api/exercises` — add custom exercise

### Meals
- `GET /api/meals?from=&to=`
- `POST /api/meals` — create meal log + entries
- `GET /api/foods/search?q=` — proxy to USDA/Open Food Facts, checks `food_items` cache first
- `DELETE /api/meals/:id`

### AI Chat
- `POST /api/chat` — main endpoint
  1. Receives user message + recent chat history (for context)
  2. Calls LLM with **tool/function-calling schema** defined for `log_meal` and `log_workout` functions
  3. LLM returns structured tool call(s), e.g.:
     ```json
     {
       "tool": "log_meal",
       "params": { "items": [{"food": "eggs", "quantity": 2, "unit": "large"}] }
     }
     ```
  4. Backend resolves each food/exercise against real data sources (USDA lookup, MET table), computes actual numbers
  5. Backend saves the resulting structured entries to `meal_entries`/`workout_entries`
  6. Backend sends the computed real numbers back to the LLM in a follow-up call, asking it to phrase a natural conversational reply
  7. Returns final assistant message + the structured data to the frontend
- `GET /api/chat/history?limit=`

### Dashboard
- `GET /api/dashboard/summary?date=` — combines today's meals + workouts + net calories

---

## 4. Suggested Function-Calling Schema for the LLM

```json
{
  "name": "log_meal",
  "description": "Log food items the user ate",
  "input_schema": {
    "type": "object",
    "properties": {
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "food": { "type": "string" },
            "quantity": { "type": "number" },
            "unit": { "type": "string" }
          },
          "required": ["food", "quantity", "unit"]
        }
      },
      "meal_type": { "type": "string", "enum": ["breakfast", "lunch", "dinner", "snack"] }
    },
    "required": ["items"]
  }
}
```

```json
{
  "name": "log_workout",
  "description": "Log exercise the user performed",
  "input_schema": {
    "type": "object",
    "properties": {
      "exercise": { "type": "string" },
      "duration_min": { "type": "number" },
      "sets": { "type": "number" },
      "reps": { "type": "number" },
      "weight_kg": { "type": "number" }
    },
    "required": ["exercise"]
  }
}
```

The unit conversion (e.g. "2 eggs" → grams) is the trickiest part — keep a small lookup table of common food-unit-to-gram conversions (an egg ≈ 50g, a slice of bread ≈ 30g, etc.) for anything not already in grams, and fall back to asking the user for clarification if the LLM can't confidently map it.

---

## 5. Build Order (suggested)

1. Auth + user profile + weight logging
2. Exercise reference table seeded with MET values + workout logging (manual form first)
3. Food search (USDA/Open Food Facts) + meal logging (manual form first)
4. Dashboard combining both
5. AI chat endpoint — start with just `log_meal`, then add `log_workout`
6. PWA setup + deployment
7. Polish: charts, streaks, PRs
