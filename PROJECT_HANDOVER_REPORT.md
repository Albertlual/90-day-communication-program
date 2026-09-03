# PROJECT_HANDOVER_REPORT.md

**Handover date:** 2026-08-26
**Scope covered:** Everything built through Day 60 of the curriculum, Phase 1
(authentication) and part of Phase 2 (curriculum data + read API).
**Status:** Deployment-ready for the current scope. Not a finished product —
see §3 for an honest breakdown of what actually works today.

---

## 1. What Is Being Built

### Overview

The **90-Day Professional Communication & Career Development Program** is a
web application implementing a structured, daily communication-skills
curriculum. It's built for one specific user: a finance/logistics
professional with humanitarian-sector experience, aiming to improve
speaking clarity, professional vocabulary, and workplace communication.

### The problem it solves

Generic communication-skills content isn't personalized to a specific
professional background, isn't structured for daily habitual practice, and
doesn't track progress over time. This application addresses that with:
a fixed 90-day curriculum (60 days currently authored) personalized to
finance/logistics/procurement/humanitarian-operations contexts, a repeating
daily sequence (tongue twister → reading → reflection → speed reading →
vocabulary → 2 speaking scenarios → completion), and persistent,
per-user progress tracking in a real database rather than browser storage.

### Main features (target scope — see §3 for what's actually built vs. planned)

- User accounts with secure authentication
- A 90-day curriculum, data-driven (stored in MongoDB, not hardcoded pages)
- Daily practice sequence with resumable progress
- AI-assisted (Gemini) evaluation of open-ended responses — planned, not yet built
- Progress dashboard and analytics — planned, not yet built

### Architecture

```
React (Vite) client  →  Express REST API  →  MongoDB (Mongoose)
                                           →  Gemini API (planned, not yet integrated)
```

Single Render Web Service in production: Express serves the built React
app as static files and exposes `/api/*` on the same origin, avoiding
cross-origin complexity. See `DEPLOYMENT_GUIDE.md` for the full deployment
process.

---

## 2. What Has Been Built

### 2.1 Authentication (Phase 1 — complete)

**What it does:** Register, log in, log out, and fetch the current user's
profile, with sessions maintained via a secure httpOnly JWT cookie.

**How it works:** Passwords are hashed with bcrypt (cost factor 12,
verified working after a dependency version bump — see §3). On login, a
JWT is signed and set as an httpOnly, `secure`-in-production cookie. A
`requireAuth` middleware verifies this cookie on protected routes and
attaches the authenticated user to `req.user`.

**Where it lives:**
- `server/models/User.js` — schema, `comparePassword()`, `toSafeObject()`
- `server/controllers/authController.js` — register/login/logout/me handlers, zod validation schemas
- `server/middleware/requireAuth.js`
- `server/routes/authRoutes.js`

**Dependencies:** `bcrypt`, `jsonwebtoken`, `zod`, `mongoose`.

**Completeness:** Fully functional and tested manually via curl (see
`DEPLOYMENT_GUIDE.md` Part 6). No automated tests exist yet. No
password-reset flow exists (out of original scope, flagged as a future
addition if wanted).

### 2.2 Curriculum data model and content (Phase 2 — partially complete)

**What it does:** Stores the 90-day curriculum as structured data (not
hardcoded frontend pages) and exposes it via a read API.

**How it works:** `DailyProgram` is one Mongoose document per day, with
embedded tongue twister, reading, reflection questions, speed-reading
passage, vocabulary term references, and exactly two speaking scenarios.
`VocabularyTerm` is a separate, global, deduplicated term bank referenced
by ObjectId from each day. Curriculum content is authored as JSON files
(not committed to the database directly) in
`server/data/curriculum/days/`, and loaded into MongoDB by
`server/scripts/seedCurriculum.js`, which upserts vocabulary terms (deduped
by name) and `DailyProgram` documents (upserted by day number) — safe to
re-run.

**Where it lives:**
- `server/models/DailyProgram.js`, `server/models/VocabularyTerm.js`
- `server/data/curriculum/days/days-01-10.json` through `days-51-60.json`
  (six files, 10 days each)
- `server/scripts/validateCurriculum.js` — structural validator, no
  database needed, checks required fields, day-number uniqueness,
  milestone rules, and global vocabulary-term uniqueness
- `server/scripts/seedCurriculum.js` — loads validated content into MongoDB
- `server/controllers/programController.js` + `server/routes/programRoutes.js`
  — `GET /api/program/day/:dayNumber`, protected by `requireAuth`

**Content status:** **60 of 90 days are fully authored and validated** —
the entire Foundation phase (Days 1–30) and Development phase (Days 31–60),
stored as six files (`days-01-10.json` ... `days-51-60.json`). Running
`seedCurriculum.js` always loads **all six files together — the full
Days 1–60 range in one run** — there is no partial-seed mode; the script
reads every `.json` file in the directory each time it runs. 342 unique
vocabulary terms, zero duplicates (independently verified, not just
validator-reported). Days 61–90 (the Advanced phase) are a documented,
resumable postponed roadmap, not started — see §6 and
`PROJECT_CONTINUATION.md` §11 for the exact plan.

**Completeness:** The data layer, validator, and seed script are complete
and tested (structurally validated; **not yet actually run against a live
MongoDB database in this environment**, since this sandbox has no network
access to MongoDB Atlas — see §3 for what "tested" means precisely here).
The API endpoint is written and syntax-checked but similarly not yet
exercised against a live database connection.

### 2.3 Server infrastructure

**What it does:** Express app setup, health check, error handling, logging.

**Where it lives:**
- `server/app.js` — CORS, JSON/cookie parsing, route mounting, production
  static file serving, 404 handler, central error handler
- `server/server.js` — env var validation (fails fast with a clear message
  if `MONGODB_URI` or `JWT_SECRET` is missing), MongoDB connection, server start
- `server/routes/healthRoutes.js` — `GET /api/health`, reports DB connection state
- `server/middleware/errorHandler.js`, `server/middleware/validateRequest.js`
- `server/utils/logger.js`, `server/utils/asyncHandler.js`

**Completeness:** Complete and verified this session — env-var fail-fast
behavior was tested directly (confirmed clean error + exit code 1 when
`.env` is absent), and the production build path was verified end to end
(see §3).

### 2.4 Client (frontend)

**What it does:** Currently, almost nothing user-facing — this is a
scaffold, not a built product.

**Where it lives:** `client/` — Vite + React, `client/src/App.jsx` is a
single placeholder component confirming the build pipeline works.
`react-router-dom` is installed but not wired into any routing yet.

**Completeness:** Deliberately minimal. No pages, no `AuthContext`, no API
service layer, no daily-program UI exist yet. This is honestly Phase 3+
work, not yet started. The production build (`vite build`) was verified
to succeed this session (see §3).

---

## 3. Current System Status

### What's actually working (verified this session, not just asserted)

- ✅ `npm run install:all` completes cleanly for both server and client
- ✅ `npm audit` reports **0 vulnerabilities** in `server/` (bcrypt was
  bumped from 5.1.1 → 6.0.0 to eliminate a transitive `tar` vulnerability;
  hash/compare behavior re-verified identical after the bump)
- ✅ `npm run build` (the exact command Render will run) succeeds and
  produces a working `client/dist/index.html` + bundled JS
- ✅ Server fails fast with a clear, actionable error (not a crash or
  silent hang) when required environment variables are missing
- ✅ `node server/scripts/validateCurriculum.js` passes with 0 errors, 0
  warnings across all 60 authored days
- ✅ 342 vocabulary terms confirmed unique via an independent script (not
  just the validator's own claim)
- ✅ Git repository initialized, `.gitignore` confirmed excluding
  `node_modules` and `.env`, initial commit made on `main`

### What has NOT been tested (be aware of this)

- ❌ **No live MongoDB connection has been tested in this environment** —
  this sandbox cannot reach MongoDB Atlas (network access is restricted to
  a fixed allowlist that doesn't include database hosts). `server.js`'s
  connection logic, `seedCurriculum.js`, and the `/api/program/day/:dayNumber`
  endpoint are code-reviewed and syntax-checked, but **you should run
  `DEPLOYMENT_GUIDE.md` Part 5–6 (seed + local test) yourself before
  trusting this in production**, since a real MongoDB round-trip has not
  actually been exercised.
- ❌ No automated tests exist (unit or integration) for any part of the
  system.
- ❌ The deployed Render service itself has not been created or verified
  by this session — `DEPLOYMENT_GUIDE.md` documents how, but the actual
  live deployment is a step you'll perform.

### Known limitations

- No password-reset/forgot-password flow.
- No rate limiting on `/api/auth/login` (the blueprint specifies rate
  limiting for future Gemini evaluation endpoints specifically; auth
  endpoints don't have it yet — worth adding before real public use).
- No automated tests.
- Frontend is a placeholder only — no actual daily-program UI.

### Known issues / advisories

- **Client dev-dependency advisory (moderate + high severity, dev-only):**
  `npm audit` in `client/` reports 2 remaining vulnerabilities in Vite's
  esbuild dev-server dependency chain. The fix requires Vite 5 → 8, a
  3-major-version jump not verified compatible in this session. This
  **only affects the local `npm run dev:client` session** (a malicious
  website could theoretically interact with your local dev server while
  it's running) — it does not affect the production build output or the
  deployed application, since Vite itself isn't part of the production
  runtime. Recommendation: address this in a dedicated session that can
  verify the Vite 8 migration doesn't break the build, rather than risk it
  immediately before this handover.
- **`react-router-dom` was bumped 6 → 7** as part of this session's
  dependency hardening, since it wasn't wired into any code yet (zero
  migration risk). When routing is actually implemented (Phase 3+), use
  the v7 API/patterns, not v6's — they differ in places.

### Configuration requirements

See `DEPLOYMENT_GUIDE.md` Part 4 in full. Summary: `MONGODB_URI` and
`JWT_SECRET` are required; `GEMINI_API_KEY` is not yet needed.

### Database status

Schema and seed tooling are complete and validated structurally. **No
database has actually been created or seeded yet** — that's the first
thing to do when you pick this up, per `DEPLOYMENT_GUIDE.md` Parts 4–5.

### Deployment status

Not deployed yet. Fully prepared to be deployed — see §5 below and
`DEPLOYMENT_GUIDE.md` for the complete process.

### Technical debt / areas to improve later

- Add rate limiting to auth endpoints before any real public traffic.
- Add automated tests before building further on top of the auth/curriculum
  foundation, so regressions are caught mechanically rather than manually.
- Revisit the Vite 8 upgrade in a dedicated session (see advisory above).
- The `.env` file lives at the project root and is loaded via a relative
  path from `server/server.js` — this works but is slightly unusual;
  document this clearly if the project structure changes later.

---

## 4. Project Structure

```
90-day-comm-program/
├── client/                          React + Vite frontend (placeholder scaffold)
│   ├── src/
│   │   ├── App.jsx                  Placeholder component only
│   │   └── main.jsx                 React entry point
│   ├── index.html
│   ├── vite.config.js                Dev-server proxy to backend on :5000
│   └── package.json
│
├── server/                          Express + MongoDB backend
│   ├── controllers/
│   │   ├── authController.js         register/login/logout/me
│   │   └── programController.js      GET /api/program/day/:dayNumber
│   ├── middleware/
│   │   ├── requireAuth.js            JWT cookie verification
│   │   ├── errorHandler.js           Central error handling
│   │   └── validateRequest.js        Generic zod request validator
│   ├── models/
│   │   ├── User.js
│   │   ├── DailyProgram.js           Curriculum content per day
│   │   └── VocabularyTerm.js         Global vocabulary term bank
│   ├── routes/
│   │   ├── authRoutes.js, programRoutes.js, healthRoutes.js
│   ├── data/curriculum/days/         Curriculum content, JSON, Days 1-60
│   ├── scripts/
│   │   ├── validateCurriculum.js     No-DB structural validator
│   │   └── seedCurriculum.js         Loads curriculum JSON into MongoDB
│   ├── utils/                        logger.js, asyncHandler.js
│   ├── app.js                        Express app config
│   ├── server.js                     Entry point, env validation, DB connect
│   └── package.json
│
├── .env.example                     Template — copy to .env, fill in real values
├── .gitignore                       Excludes node_modules, .env, dist
├── package.json                     Root — orchestrates client build + server start
├── README.md                        Quick setup reference
├── CURRICULUM_MAP.md                90-day structural plan + full vocabulary log
├── PROJECT_CONTINUATION.md          Curriculum/development continuation record
├── DEPLOYMENT_GUIDE.md              Step-by-step deployment instructions (this handover's companion doc)
└── PROJECT_HANDOVER_REPORT.md       This file
```

### Which files matter for which purpose

- **Resuming curriculum authoring (Days 61–90):** `PROJECT_CONTINUATION.md`
  §11, then `CURRICULUM_MAP.md`.
- **Deploying or redeploying:** `DEPLOYMENT_GUIDE.md`.
- **Understanding what's built vs. not:** this file, particularly §3.
- **Building the actual frontend (Phase 3+):** start from
  `client/src/App.jsx`, `PROJECT_CONTINUATION.md` §2's Frontend Architecture
  notes, and the original blueprint's design-system guidance (not
  reproduced in full here — see the project's very first blueprint
  conversation/artifact if available).

---

## 5. Deployment Handover

Everything needed to deploy this project is in `DEPLOYMENT_GUIDE.md`.
Summary of what you need to supply yourself (**never share these
values** — they are not included anywhere in this codebase or its
history):

| Value | Where it's used | How to get it |
|---|---|---|
| MongoDB connection string | `MONGODB_URI` env var | Create a free MongoDB Atlas cluster — `DEPLOYMENT_GUIDE.md` Part 4.2 |
| A random signing secret | `JWT_SECRET` env var | Generate locally with a one-line Node command — `DEPLOYMENT_GUIDE.md` Part 4.3 |
| GitHub repository | Code hosting for Render to pull from | Create an empty repo on GitHub — `DEPLOYMENT_GUIDE.md` Part 7 |
| Render account | Hosting the live service | Free signup at render.com — `DEPLOYMENT_GUIDE.md` Part 8 |

No API keys are currently required for Gemini, since that integration
hasn't been built. When it is (Phase 4+), a `GEMINI_API_KEY` environment
variable slot already exists in `.env.example` and Render's env var table
in the deployment guide, ready to be filled in without any code restructuring.

**Render configuration** (also in `DEPLOYMENT_GUIDE.md` Part 8):
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Required env vars: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`
- Health check path: `/api/health`

---

## 6. Remaining Development Work (Postponed Roadmap)

This work was planned but is **not started**, per the user's explicit
decision to move to deployment with the current 60-day scope. Nothing
below is abandoned — it's documented precisely so it can resume without
re-deriving any of this planning.

### Days 60–70 (Batch 7 — first Advanced-phase batch)

Domain rotation continues the same 10-day pattern (communication
foundations, procurement, logistics, humanitarian operations, financial
reporting, inventory, audit, teamwork, stakeholder relations, milestone).
Rule changes for this phase: tongue twisters move to full "professional
speaking warm-ups" (complete complex sentences, not isolated sound
patterns); speaking scenarios increasingly don't name a framework in
advance, closer to genuinely unprepared questions; executive/persuasive
framing becomes an explicit focus. Day 70 is Milestone 7. Full detail:
`PROJECT_CONTINUATION.md` §11.

### Days 70–80 (Batch 8)

Same rotation and rules as Batch 7, at greater depth. Day 80 is Milestone 8.

### Days 80–90 (Batch 9)

Same rotation. **Day 90 is the full program capstone** — should synthesize
across all 90 days (not just Days 81–89) and give the user a genuine sense
of completing the program, following the same "bigger milestone" pattern
established at Days 30 and 60.

### Application features beyond curriculum content (Phases 3–10 of the original roadmap)

Independent of the Days 61–90 curriculum gap, these are simply not built
yet regardless of how many curriculum days exist:

| Phase | What it covers |
|---|---|
| 3 | `DailyProgress` model, `/day/:dayNumber` frontend page, resume logic |
| 4 | Reading + Reflection stage UI, Gemini reflection evaluation |
| 5 | Speed Reading stage, WPM calculation, comprehension evaluation |
| 6 | Vocabulary stage, spaced repetition |
| 7 | Speaking scenario UI, Gemini speaking evaluation |
| 8 | Day Completion screen, progress analytics dashboard |
| 9 | Responsive/accessibility polish, design-system implementation |

None of these are blocked by the Days 61–90 postponement — they could be
built now, against the 60 days of content that already exist, whenever
that work resumes.

---

## 7. Summary

**What you have:** a working, tested authentication system; a complete,
validated, 60-day curriculum content layer with a read API; a verified,
reproducible build and deployment pipeline; and complete documentation for
both picking curriculum work back up and for deploying what exists today.

**What you don't have yet:** the actual daily-program user interface, AI
evaluation, or a live, deployed instance — those are the honest next steps,
laid out precisely above.
