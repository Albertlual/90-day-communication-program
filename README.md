# 90-Day Professional Communication & Career Development Program

A multi-page, authenticated web app implementing a structured 90-day
communication/career-development curriculum with progress tracking and
Gemini-assisted evaluation of open-ended responses.

**Current status:** Phase 1 (authentication foundation) implemented.
See `PROJECT_CONTINUATION.md` for full status, architecture, and the exact
next step — read that file first if you're picking this project back up.

## Stack

- Backend: Node.js, Express, MongoDB (Mongoose), JWT (httpOnly cookie), bcrypt
- Frontend: React + Vite (scaffolded, pages not yet built)
- AI: Google Gemini API (backend-only, not yet integrated — Phase 4+)
- Deployment target: Render (single Web Service, see blueprint)

## Setup

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then fill in `.env` with real values:
   - `MONGODB_URI` — your MongoDB Atlas connection string (you must create this yourself)
   - `JWT_SECRET` — a long random string (generate with the command in `.env.example`)
   - `CLIENT_URL` — `http://localhost:5173` for local dev
   - `GEMINI_API_KEY` — not required until Phase 4, leave blank for now

3. **Run in development** (two terminals)
   ```bash
   npm run dev:server   # Express API on http://localhost:5000
   npm run dev:client   # Vite dev server on http://localhost:5173
   ```
   The Vite dev server proxies `/api/*` requests to Express, so the frontend
   can call relative paths like `fetch('/api/auth/me')` in both dev and prod.

4. **Verify the backend**
   ```bash
   curl http://localhost:5000/api/health
   ```

## Testing the auth API directly (no frontend UI yet)

```bash
# Register
curl -c cookies.txt -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (uses the cookie saved above)
curl -b cookies.txt http://localhost:5000/api/auth/me

# Logout
curl -b cookies.txt -X POST http://localhost:5000/api/auth/logout
```

## Curriculum content

The 90-day curriculum lives as data, not code, under
`server/data/curriculum/days/` — one JSON file per 10-day batch. See
`CURRICULUM_MAP.md` for the structural plan and `PROJECT_CONTINUATION.md`
§8/§10 for which batches are authored so far.

```bash
node server/scripts/validateCurriculum.js   # check structure, no DB needed
node server/scripts/seedCurriculum.js       # load into MongoDB (needs MONGODB_URI)
```

## Project structure

See `PROJECT_CONTINUATION.md` for the full annotated folder structure and
architecture reference.
