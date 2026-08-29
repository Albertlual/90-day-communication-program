# PROJECT_CONTINUATION.md

Last updated: 2026-08-26 — Phase 2, Batch 6 (Days 51–60) complete —
**Development phase fully authored (Days 1–60). Curriculum authoring is
now PAUSED — the user has decided to move to deployment with the current
60-day scope. Days 61–90 (Batches 7–9) are documented as a postponed
roadmap in §11, not abandoned.**

**If you are picking this project up to continue curriculum authoring**,
read §11 first — it has the exact resumption instructions. **If you are
picking this project up for deployment or operational work**, see
`DEPLOYMENT_GUIDE.md` and `PROJECT_HANDOVER_REPORT.md` at the project root
instead — this file remains the curriculum/development continuation
record specifically.

This file is the source of truth for resuming this project, including in a
brand-new AI chat session with no memory of prior conversations. Read this
entire file before writing or changing any code. Also read
**CURRICULUM_MAP.md** — the structural plan for the full 90-day curriculum —
before authoring any further batches of content.

---

## 1. Project Overview

**What we're building:** a multi-page, authenticated web application called
the *90-Day Professional Communication & Career Development Program*. It
walks one user through a structured 90-day daily sequence:

`Tongue Twister → Active Reading → Reading Reflection → Speed Reading →
Professional Vocabulary → 2 Professional Speaking Scenarios → Day Complete`

Curriculum content is data-driven (MongoDB, not hard-coded pages) and
personalized to a finance/logistics/humanitarian-operations professional
background. Google Gemini evaluates open-ended user responses (reflections,
speed-reading comprehension, speaking answers) and returns structured
coaching-style feedback, called only from the backend.

**Technology stack:**
- Backend: Node.js, Express, MongoDB, Mongoose, JWT (httpOnly cookie), bcrypt, zod
- Frontend: React + Vite + React Router (scaffolded; pages not built yet)
- AI: Google Gemini API — backend-only, not yet integrated (starts Phase 4)
- Deployment target: Render, single Web Service (Express serves the built React app)

---

## 2. Blueprint Reference (original architectural decisions)

The full original blueprint was produced before implementation began. Key
decisions that MUST be preserved unless there is a strong, explicitly stated
reason to change them:

- **Deployment shape:** one Render Web Service. Express serves the built
  React bundle as static files in production (`NODE_ENV=production`) and
  exposes `/api/*`. Avoids CORS/cookie cross-origin issues in prod.
- **Daily flow is ONE route** (`/day/:dayNumber`) with internal stage state —
  not seven separate routes per stage.
- **Six MongoDB models only** (not the larger example list from the original
  prompt): `User`, `DailyProgram`, `VocabularyTerm`, `DailyProgress`,
  `UserResponse` (AI evaluation embedded 1:1, no separate collection),
  `VocabularyProgress`.
- **Gemini is called from exactly one module**, `server/services/geminiService.js`
  (not yet created — Phase 4). Controllers never call the Gemini SDK directly.
- **Progress lives in MongoDB, not localStorage.**
- **JWT in an httpOnly, secure (in prod), sameSite=lax cookie** — not
  localStorage, not a bearer header.
- **Every user-scoped query is filtered by `req.user.id`** server-side —
  never trust a client-supplied user/owner ID.
- **No admin CMS UI in MVP** — schema supports it later.
- **Design system:** max 3 primary colors, no purple/blue AI-gradient
  clichés, serif for long-form reading passages, sans for UI chrome.

**Folder structure** (blueprint target — items marked `[x]` exist now, `[ ]` don't yet):

```
90-day-comm-program/
├── client/
│   ├── src/
│   │   ├── components/        [ ] not created yet
│   │   ├── pages/              [ ] not created yet
│   │   ├── context/            [ ] not created yet (AuthContext.jsx)
│   │   ├── hooks/               [ ] not created yet
│   │   ├── services/            [ ] not created yet (api.js etc.)
│   │   ├── styles/               [ ] not created yet
│   │   ├── App.jsx               [x] placeholder only
│   │   └── main.jsx               [x]
│   ├── index.html                 [x]
│   ├── vite.config.js              [x]
│   └── package.json                [x]
│
├── server/
│   ├── controllers/
│   │   ├── authController.js       [x]
│   │   └── programController.js    [x]  (progressController, evaluationController,
│   │                                      vocabularyController not yet created)
│   ├── middleware/
│   │   ├── requireAuth.js          [x]
│   │   ├── errorHandler.js         [x]
│   │   └── validateRequest.js      [x]
│   ├── models/
│   │   ├── User.js                 [x]
│   │   ├── DailyProgram.js         [x]
│   │   └── VocabularyTerm.js       [x]  (DailyProgress, UserResponse, VocabularyProgress
│   │                                      not yet created — start Phase 3 / Phase 6)
│   ├── routes/
│   │   ├── authRoutes.js           [x]
│   │   ├── programRoutes.js        [x]
│   │   └── healthRoutes.js         [x]  (small addition beyond the original blueprint list —
│   │                                      justified: needed for Render health checks)
│   ├── services/                    [ ] empty — geminiService.js etc. start Phase 4
│   ├── data/
│   │   └── curriculum/
│   │       └── days/
│   │           ├── days-01-10.json [x]  Batch 1, Days 1–10 (Foundation), authored + validated
│   │           ├── days-11-20.json [x]  Batch 2, Days 11–20 (Foundation), authored + validated
│   │           ├── days-21-30.json [x]  Batch 3, Days 21–30 (Foundation), authored + validated —
│   │           │                        Day 30 = Milestone 3 + Foundation phase capstone
│   │           ├── days-31-40.json [x]  Batch 4, Days 31–40 (Development), authored + validated —
│   │                                     STAR + Problem-Cause-Solution frameworks introduced,
│   │                                     readings ~32% longer than Foundation phase
│   │           ├── days-41-50.json [x]  Batch 5, Days 41–50 (Development), authored + validated
│           └── days-51-60.json [x]  Batch 6, Days 51–60 (Development), authored + validated —
│                                     Day 60 = Milestone 6 + Development→Advanced phase capstone
│           (days-61-70.json, days-71-80.json, days-81-90.json — POSTPONED, see §11)
│   ├── utils/
│   │   ├── logger.js               [x]
│   │   └── asyncHandler.js         [x]
│   ├── scripts/
│   │   ├── validateCurriculum.js   [x]  structural validator, no DB needed
│   │   └── seedCurriculum.js       [x]  upserts curriculum JSON into MongoDB (not yet run —
│   │                                      user will seed once all batches are authored)
│   ├── app.js                       [x]
│   ├── server.js                    [x]
│   └── package.json                 [x]
│
├── .env.example                     [x]
├── .gitignore                       [x]
├── package.json                     [x]  (root — orchestrates client build + server start)
├── README.md                        [x]
├── CURRICULUM_MAP.md                [x]  90-day structural plan — read before authoring further batches
├── PROJECT_CONTINUATION.md          [x]  (this file — curriculum/dev continuation record)
├── DEPLOYMENT_GUIDE.md              [x]  step-by-step: VS Code → Git → Render, beginner-friendly
└── PROJECT_HANDOVER_REPORT.md       [x]  full handover: what's built, status, structure, roadmap
```

**Database models — target design** (only `User` implemented so far; see §7
of the original blueprint response in chat history, or ask the next AI
session to reconstruct from the folder-structure comments above and the
implemented `User.js` as a style reference, if the full blueprint text isn't
available).

**API structure — implemented so far:**

| Method & Path | Auth | Status |
|---|---|---|
| `POST /api/auth/register` | – | ✅ implemented |
| `POST /api/auth/login` | – | ✅ implemented |
| `POST /api/auth/logout` | – | ✅ implemented |
| `GET /api/auth/me` | ✓ | ✅ implemented |
| `GET /api/health` | – | ✅ implemented (small addition beyond blueprint's original list) |
| `GET /api/program/day/:dayNumber` | ✓ | ✅ implemented — returns a day's curriculum with vocabulary populated, 404 if that day hasn't been seeded yet |
| Everything else (`/api/progress/*`, `/api/evaluate/*`, `/api/vocabulary/*`, `/api/dashboard`) | — | ❌ not implemented — Phases 3–8 |

**Authentication/security decisions implemented:**
- Passwords hashed with bcrypt, cost factor 12.
- JWT signed with `JWT_SECRET`, 30-day expiry, stored in an httpOnly cookie
  (`secure: true` only when `NODE_ENV=production`, `sameSite: 'lax'`).
- `requireAuth` middleware verifies the cookie and attaches `req.user`
  (the full Mongoose document — use `.toSafeObject()` before sending to client).
- Register/login bodies validated server-side via zod (`validateRequest` middleware).
- Login returns an identical error message whether the email doesn't exist or
  the password is wrong (`"Invalid email or password"`) — never reveals which.
- Central `errorHandler` returns a generic message for 500s; full detail goes
  to `logger.error` only, never to the client.

**Deployment approach:** single Render Web Service. Build command
`npm install && npm run build` (root `build` script installs both
server + client deps and builds the client). Start command `npm start`
(root `start` script runs `npm start --prefix server`, i.e. `node server.js`).
`NODE_ENV=production` makes `server/app.js` serve `client/dist` as static
files and fall through to `index.html` for client-side routing. Health check
path: `/api/health`.

---

## 3. Current Implementation Status

### What's completed (Phase 2, Batch 6 — this session) — Development phase done, curriculum authoring paused

- **Days 51–60 fully authored** in `server/data/curriculum/days/days-51-60.json`,
  completing the entire Development phase (Days 31–60). Combined with the
  Foundation phase, **60 of the planned 90 days now have complete curriculum
  content.**
- **Day 60 is a double milestone**, following the same pattern as Day 30:
  it's Milestone 6 in the regular pattern, plus the Development→Advanced
  phase capstone. Its reading and both speaking scenarios synthesize across
  the full Development phase (Days 31–59) and explicitly preview what the
  (now-postponed) Advanced phase would have changed.
- 57 more new vocabulary terms authored, **zero overlap** with the 285 from
  Batches 1–5 — verified by `validateCurriculum.js` across all 60 days
  *and* independently by a separate script (0 duplicates either way; a
  defensive per-field scenario check also ran clean). **342 unique
  vocabulary terms now exist across Days 1–60.**
- `node server/scripts/validateCurriculum.js` run against **all 60 days
  together**: 0 errors, 0 warnings.
- **Per the user's explicit instruction this session, curriculum authoring
  now stops here.** Batches 7–9 (Days 61–90, the Advanced phase) are
  documented as a postponed roadmap in §11, not started, and not
  abandoned — resuming them later is a normal continuation of this same
  project, not a redesign.
- CURRICULUM_MAP.md updated: §8 index table (Days 51–60 ✅, Days 61–90
  marked 🛑 POSTPONED with a pointer to §11 of this file), §9 running
  vocabulary list (now 342 terms), §10 batch log (Batches 7–9 marked
  POSTPONED). Header-count sanity check run and passed (6/6 batch headers
  present) before moving on, per the process established after the Batch 4
  session's documentation errors.
- **New this session:** `DEPLOYMENT_GUIDE.md` and `PROJECT_HANDOVER_REPORT.md`
  created at the project root — see those files for full deployment and
  handover documentation. This file (`PROJECT_CONTINUATION.md`) remains the
  record for resuming curriculum authoring specifically.

### What's completed (Phase 2, Batch 5 — prior session, still current)

- **Days 41–50 fully authored** in `server/data/curriculum/days/days-41-50.json`,
  continuing the Development phase established in Batch 4 with **no new
  rule changes** — same conventions applied consistently:
  - `phase: "development"` on all 10 days (confirmed by script).
  - Readings averaging 385 words, consistent with Batch 4's 384-word
    average (confirmed by script) — each still genuinely compares two
    ideas (e.g., aggregated demand vs. reverse auctions, incremental vs.
    zero-based budgeting, vendor-managed vs. self-managed inventory,
    standups vs. longer meetings, letters of intent vs. NDAs vs. escrow).
  - Speaking scenarios continue mixing PREP, Problem→Cause→Solution, and
    the ad-hoc Foundation-phase structures deliberately across days, rather
    than defaulting to one framework.
  - Tongue twisters remain at "advanced" difficulty with 3-repetition
    targets, matching Batch 4's tier.
- 57 more new vocabulary terms authored, **zero overlap** with the 228 from
  Batches 1–4 — verified by `validateCurriculum.js` across all 50 days
  *and* independently by a separate script (0 duplicates either way).
  **285 unique vocabulary terms now exist across Days 1–50.**
- `node server/scripts/validateCurriculum.js` run against **all 50 days
  together**: 0 errors, 0 warnings. Milestone days confirmed at exactly
  10, 20, 30, 40, 50 by independent script check.
- CURRICULUM_MAP.md and this file were both updated using **small, targeted
  edits with a post-edit `grep` header-count check after each**, per the
  process established after last session's two documentation mistakes —
  no repeat of that error this session; all 5 batch headers confirmed
  present in CURRICULUM_MAP.md §9 after editing.

### What's completed (Phase 2, Batch 4 — prior session, still current)

- **Days 31–40 fully authored** in `server/data/curriculum/days/days-31-40.json`,
  the first batch in the Development phase (Days 31–60).
- **This batch changes real rules, not just difficulty**, per CURRICULUM_MAP.md
  §4's Development column, and this was verified programmatically, not just
  asserted:
  - `phase: "development"` set correctly on all 10 days (confirmed via script:
    30 Foundation-phase days, 10 Development-phase days).
  - **STAR framework** introduced (Day 31, formally taught as a vocabulary
    term and used in a behavioral interview scenario) and **Problem→Cause→Solution**
    introduced (used across several days), alongside continued PREP and the
    ad-hoc structures from the Foundation phase. 17 distinct framework/structure
    labels are now in use across Days 1–40 (confirmed via script).
  - Readings are measurably longer: **290 words average across the Foundation
    phase → 384 words average in Batch 4** (confirmed via script, not
    estimated) — each Development-phase reading also genuinely compares two
    valid ideas (e.g., just-in-time vs. buffer stock, cross-docking vs. supply
    chain resilience, restricted vs. unrestricted funds) rather than
    explaining one concept cleanly, matching the "more nuance, comparing two
    ideas" instruction in the blueprint.
  - Tongue twisters stepped up to `"advanced"` difficulty with longer,
    multi-clause phrases and lower repetition targets (3, down from 4–5).
  - Day 31's STAR-framework speaking scenario handles the CV-safety rule
    carefully: the model answer is explicitly labeled illustrative in its
    guidance and bracketed note, since STAR requires a specific "time when"
    story that can't be safely invented as the user's own — this is a
    pattern future STAR-based scenarios should follow.
- 57 more new vocabulary terms authored, **zero overlap** with the 171 from
  the Foundation phase — verified two ways: by `validateCurriculum.js`
  across all 40 days, and independently by a separate script that flattened
  every term and checked for duplicates directly (0 duplicates found either
  way). **228 unique vocabulary terms now exist across Days 1–40.**
- `node server/scripts/validateCurriculum.js` run against **all 40 days
  together**: 0 errors, 0 warnings.
- CURRICULUM_MAP.md updated: §8 index table (Days 31–40 now ✅), §9 running
  vocabulary list (now 228 terms) plus a new framework-usage note, §10
  batch log. **Caught and fixed a self-introduced bug while editing §9**:
  a large string replacement accidentally deleted Batch 3's vocabulary list
  entirely; caught by grepping the file for all `**Batch` headers after the
  edit, rather than assuming the edit succeeded as intended, and restored
  before packaging.

### What's completed (Phase 2, Batch 3 — prior session, still current)

- **Days 21–30 fully authored** in `server/data/curriculum/days/days-21-30.json`,
  completing the entire Foundation phase (Days 1–30).
- **Day 30 is a double milestone**, as planned in CURRICULUM_MAP.md §6: it's
  both Milestone 3 (the regular every-10-days pattern) and the Foundation →
  Development phase capstone. Its reading, reflection questions, and both
  speaking scenarios explicitly synthesize across all 30 days — not just
  Days 21–29 — and preview what changes in the Development phase.
- Content continues to deepen within the Foundation tier: e.g., Day 22 goes
  beyond Day 2's and Day 12's procurement content into conflict of interest
  and emergency-procurement policy reasoning; Day 27 goes beyond Days 7/17
  into the internal-vs-external audit distinction and whistleblower policy.
- 57 more new vocabulary terms authored, **zero overlap** with Batches 1–2's
  114 — verified by `validateCurriculum.js` across all 30 days.
  **171 unique vocabulary terms now exist across the Foundation phase.**
- `node server/scripts/validateCurriculum.js` run against **all 30 days
  together**: 0 errors, 0 warnings.
- CURRICULUM_MAP.md updated: §8 index table (Days 21–30 now ✅, Foundation
  phase fully marked complete), §9 running vocabulary list (now 171 terms),
  §10 batch log.

### What's completed (Phase 2, Batches 1–2 — prior sessions, still current)

- **CURRICULUM_MAP.md**: the full 90-day structural plan — spiral curriculum
  design, 10-day domain rotation, phase progression rules (tongue-twister
  tier / framework introduction / difficulty by phase), milestone-day rule,
  vocabulary no-repeat rule, CV-safety rule for speaking model answers, and
  a running list of all vocabulary terms used so far. **Every future batch
  must be checked against this file before authoring.**
- `DailyProgram` model: one document per day, embedded tongue twister,
  reading, reflection questions, speed reading passage + comprehension
  questions, vocabulary term references, and exactly 2 speaking scenarios.
  Added `isMilestone` (Boolean) and `reviewFocus` (String) fields beyond the
  original blueprint schema, and expanded `reading.sourceType` to include
  `'original'` — all documented as intentional, justified additions.
- `VocabularyTerm` model: global term bank, unique by term name.
- **`server/data/curriculum/days/days-01-10.json`** (Batch 1) and
  **`days-11-20.json`** (Batch 2): Days 1–20 fully authored — original
  (copyright-safe) reading content, tongue twisters, reflection questions,
  speed-reading passages with comprehension questions, 6 vocabulary terms
  per day (3 on each milestone day), and 2 speaking scenarios per day
  (1 domain-knowledge, 1 workplace-communication skill), each with
  situation/category/framework/guidance/modelAnswer. Speaking model answers
  referencing the user's background use only confirmed CV facts (see
  CURRICULUM_MAP.md §7). Batch 2 deepened the same nine domains rather than
  repeating Batch 1's content or vocabulary.
- `server/scripts/validateCurriculum.js`: a dependency-free, no-DB-needed
  structural validator — checks required fields, day-number uniqueness,
  milestone rules, vocabulary-term global uniqueness, and that
  `speedReading.wordCount` matches the actual passage. **Run and passed
  clean against Days 1–20** (0 errors, 0 warnings) as of end of Batch 2.
- `server/scripts/seedCurriculum.js`: reads every JSON file in
  `data/curriculum/days/`, upserts vocabulary terms (deduped by name) and
  `DailyProgram` documents (upserted by `dayNumber`) into MongoDB. **Not yet
  run** — per the user's instruction, seeding happens once all 90 days are
  authored and the files are copied into their own IDE/environment.
- `GET /api/program/day/:dayNumber`: new `programController.js` +
  `programRoutes.js`, mounted in `app.js`, protected by `requireAuth`.
  Returns 400 for an out-of-range day number, 404 if that day hasn't been
  seeded yet, 200 with the populated day otherwise.
- Word counts (`speedReading.wordCount`) and reading time estimates
  (`reading.estimatedMinutes`) were computed programmatically from the
  actual authored text, not hand-guessed — verified via a Node script,
  not asserted.

### What's completed (Phase 1, prior batch — unchanged, still current)

- Full repo scaffold matching the blueprint folder structure (see tree above).
- `User` Mongoose model: `name`, `email` (unique), `passwordHash`,
  `professionalContext {role, background, focusAreas}`, `currentDay`,
  `streak`, `lastActiveDate`, timestamps. Instance methods:
  `comparePassword(candidate)`, `toSafeObject()`.
- Auth endpoints, all working end-to-end against a real MongoDB connection:
  - `POST /api/auth/register` — validates input, checks for duplicate email,
    hashes password, creates user, signs JWT, sets cookie, returns safe user object (201).
  - `POST /api/auth/login` — validates input, checks credentials, updates
    `lastActiveDate`, signs JWT, sets cookie, returns safe user object (200).
  - `POST /api/auth/logout` — clears the cookie (200).
  - `GET /api/auth/me` — protected by `requireAuth`, returns the current
    user's safe object (200), or 401 if not authenticated.
- `requireAuth` middleware: verifies JWT from cookie, loads user, 401 on any failure.
- `validateRequest` middleware: generic zod-schema request-body validator, reusable for future endpoints.
- `errorHandler` middleware: central error handling, no stack traces to client.
- `GET /api/health`: returns server + MongoDB connection status (small,
  justified addition to the blueprint's original endpoint list — needed for
  Render's health check configuration).
- `server.js`: validates required env vars on boot (`MONGODB_URI`,
  `JWT_SECRET`), connects to MongoDB, then starts Express.
- `app.js`: CORS (credentials-enabled, origin from `CLIENT_URL`), JSON body
  parsing, cookie parsing, route mounting, production static-file serving,
  404 handler for unmatched `/api` routes, central error handler.
- Minimal Vite + React client scaffold: builds and runs, single placeholder
  `App.jsx`, dev-server proxy to the Express API configured. **No pages,
  routing, AuthContext, or UI components yet — intentionally deferred.**
- `README.md` with install/run/test instructions (including curl examples
  for testing auth without a UI).
- `.env.example`, `.gitignore`, root `package.json` orchestrating both apps.

### What remains unfinished

- **Curriculum content: Days 51–90 (Batches 6–9)** — not authored. Days
  41–50 are complete; Days 51–60 remain in Development (Day 60 is a phase
  capstone, like Day 30), and 61–90 remain in Advanced. See §4 for the
  exact next batch and CURRICULUM_MAP.md §8/§10 for full batch status.
- `DailyProgress`, `UserResponse`, `VocabularyProgress` models — not
  created yet (Phase 3 and Phase 6).
- All progress/evaluation/vocabulary API routes and controllers — not created.
- `geminiService.js` and any Gemini integration — not created (Phase 4+).
- Entire frontend beyond the placeholder `App.jsx`: no `AuthContext`, no
  `api.js` service wrapper, no pages (`Login`, `Register`, `Dashboard`,
  `DailyProgram`, etc.), no reusable UI components, no design tokens/CSS.
- No tests exist yet (backend or frontend).
- Actual seeding into a live MongoDB has not been run in this environment —
  by design, per the user's instruction (see §4).

### Known limitations / TODOs

- No password-reset / forgot-password flow (not in original blueprint scope; flag if wanted).
- No rate limiting yet on auth endpoints (blueprint specifies rate limiting
  for `/api/evaluate/*`, not explicitly for auth — worth adding to auth too
  before real deployment, e.g. `express-rate-limit` on `/api/auth/login`).
- `client/package.json` lists `react-router-dom` as a dependency in
  anticipation of Phase 3+ routing, but it is not wired into `App.jsx` yet.
- No automated tests yet (deferred per blueprint's "don't build a testing
  framework before the core app works").
- MongoDB Atlas cluster, and the values in `.env`, must be provided by the
  human developer — `seedCurriculum.js` exists and is ready to run but has
  deliberately not been executed against a live database yet.
- `validateCurriculum.js`'s vocabulary-uniqueness check only sees files that
  physically exist in `data/curriculum/days/` at the time it's run — always
  run it after adding a new batch, and check CURRICULUM_MAP.md §9's running
  term list too, since that list is the fast manual cross-check while only
  Batch 1 exists to run the script against.

---

## 4. Exact Next Step

**Curriculum authoring is paused. There is no "next batch" to author right
now.** The project's current state (Days 1–60, fully authored and
validated) is being taken to deployment instead, per the user's explicit
instruction in the Batch 6 session.

**If a future session is asked to resume curriculum authoring** (Batch 7,
Days 61–70), the exact resumption instructions are in §11 below — read
that section in full before starting, since it captures both the Advanced
phase's rule changes and the reasoning behind them, the same way Batch 4's
session had to internalize the Development phase's changes before writing
a single word of content.

**If a future session is asked to continue deployment or operational
work** instead, this file is the wrong starting point — read
`DEPLOYMENT_GUIDE.md` and `PROJECT_HANDOVER_REPORT.md` at the project root
first.

No code, model, or route changes are pending from the curriculum side.
`DailyProgress`, the `/day/:dayNumber` frontend page, and Gemini
integration remain Phase 3/4 work, unaffected by this pause — they were
never blocked on Days 61–90 existing, only on Days 1–60 (or even just a
usable subset) existing, which they now do.

---

## 5. Development Rules

- Do not redesign the architecture without a strong, explicitly stated reason.
- Do not duplicate files unnecessarily — check whether an existing file
  already owns a responsibility before creating a new one.
- Keep all Gemini calls backend-only, isolated to `geminiService.js` once created.
- Keep progress data in MongoDB, never localStorage (localStorage is fine
  only for transient UI state, not learning progress).
- Follow the security decisions already made: httpOnly JWT cookie, bcrypt
  hashing, server-side validation via zod, `req.user.id`-scoped queries.
- Keep the implementation intentionally compact — avoid creating a file for
  every tiny piece of logic; prefer the existing controller/service/model layering.
- When a phase is finished, update this document (see §9 Change Log) before ending the session.
- **Curriculum content is a first-class deliverable, not filler.** Every day
  must be genuinely distinct — no repeated sentence patterns across days,
  no reused vocabulary terms (check CURRICULUM_MAP.md §9 and re-run
  `validateCurriculum.js`), and speaking model answers referencing the
  user's background must follow the CV-safety rule in CURRICULUM_MAP.md §7
  exactly — never invent an employer, achievement, date, or number not on
  that list.
- Author curriculum content in the 10-day batches defined in CURRICULUM_MAP.md
  §10, in order. Don't skip ahead to a later batch or jump between content
  types (all tongue twisters, then all vocabulary, etc.) — see the
  "day-batch vs. content-type" discussion resolved at the start of Phase 2:
  batching by day keeps every batch complete, testable, and thematically
  coherent within each day.
- Do not run `seedCurriculum.js` against a live database until the user
  explicitly asks for it — they've stated they want all 90 days authored
  first, then to seed once, after copying the files into their own setup.

---

## 6. Environment / Setup Information

**Install dependencies:**
```bash
npm run install:all
```

**Run locally** (two terminals):
```bash
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

**Required environment variables** (copy `.env.example` to `.env` in the project root):

| Variable | Required for Phase 1 | You must provide it |
|---|---|---|
| `PORT` | optional (defaults to 5000) | no, has default |
| `MONGODB_URI` | **yes** | **yes — create a free MongoDB Atlas cluster and paste the connection string** |
| `JWT_SECRET` | **yes** | **yes — generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`** |
| `CLIENT_URL` | yes (for CORS) | no, use `http://localhost:5173` locally |
| `NODE_ENV` | yes | no, use `development` locally |
| `GEMINI_API_KEY` | not yet (Phase 4+) | yes, when that phase starts — you said you already have one |

No secrets are embedded anywhere in this codebase. `.env` is gitignored.

**Curriculum tooling** (no database needed for the first command):
```bash
node server/scripts/validateCurriculum.js   # structural check, run after every batch
node server/scripts/seedCurriculum.js       # loads all authored batches into MongoDB —
                                             # only run once MONGODB_URI is set AND
                                             # the user is ready to seed (see §5 rules)
```

**MongoDB configuration:** any MongoDB Atlas free-tier cluster works. In
Atlas → Network Access, allow `0.0.0.0/0` for now (Render's shared-tier
services don't have a static outbound IP) and rely on a strong database
user password kept only in `.env` / Render's environment variable settings.

---

## INSTRUCTIONS FOR THE NEXT AI SESSION

If you are an AI assistant picking up this project in a new session:

1. Read this document in full before touching any code.
2. Inspect the existing project files (`server/`, `client/`, root configs)
   before changing anything — do not assume this document is 100% exhaustive
   of every line of code; verify against the actual files.
3. Continue from the exact state recorded in §3 (Current Implementation Status).
4. Do not restart the project from scratch, do not re-scaffold, do not
   rewrite Phase 1 files unless a genuine bug is found.
5. Do not assume you have access to the original chat conversation —
   everything you need to know should be in this file.
6. Treat the original blueprint's architectural decisions (§2 here) as the
   source of truth for anything not fully detailed elsewhere in this file.
7. Ask the user only what's genuinely necessary (e.g., missing secrets);
   otherwise proceed with implementation using the smallest reasonable
   assumption, clearly stated.
8. Before ending your session, update: §3 (status), §4 (exact next step),
   §8 (phase checklist), and §9 (change log) in this file, and provide the
   user an updated downloadable copy of this file (and ideally a fresh zip
   of the whole project).

---

## 8. Phase Tracking

| Phase | Description | Status |
|---|---|---|
| 0 | Repo scaffold, env config, health check, deploy pipeline | ✅ done (folded into Phase 1 delivery) |
| 1 | Auth: register/login/logout/me, User model, requireAuth | ✅ done |
| 2 | DailyProgram + VocabularyTerm models, validate/seed scripts, `/api/program/day/:dayNumber`, 90-day curriculum content | 🔶 **paused at Days 1–60** (Foundation + Development phases complete, 342 vocab terms). Days 61–90 (Advanced phase, Batches 7–9) are a documented, resumable postponed roadmap — see §11. This is a deliberate scope decision for this deployment, not a blocker. |
| 3 | DailyProgress model + `/day/:dayNumber` page + resume logic | ⬜ pending — **not started**. This is real, honest scope: the deployed app has no daily-program frontend yet. |
| 4 | Reading + Reflection stage + Gemini reflection evaluation | ⬜ pending |
| 5 | Speed Reading stage + WPM calc + comprehension evaluation | ⬜ pending |
| 6 | Vocabulary stage + spaced repetition | ⬜ pending |
| 7 | Speaking scenarios + Gemini speaking evaluation | ⬜ pending |
| 8 | Day Completion screen + progress analytics dashboard | ⬜ pending |
| 9 | Responsive/accessibility pass, design-system polish | ⬜ pending |
| 10 | Render deployment, production hardening | 🔶 **in progress — this session.** See `DEPLOYMENT_GUIDE.md` for the full process and `PROJECT_HANDOVER_REPORT.md` for exactly what is and isn't functional in this deployment. |

**Honest summary of what's being deployed:** working authentication
(register/login/logout/me), a health check endpoint, a read API for
curriculum content (`/api/program/day/:dayNumber`) backed by 60 fully
authored and validated days of content once seeded, and a placeholder
frontend that confirms the build pipeline works. **The actual daily-program
learning experience — the thing a user would interact with day to day —
has not been built yet.** This is Phase 3 onward, still pending. Deploying
now makes sense as a checkpoint (working auth + real content + a live
URL), not as a claim that the product is feature-complete for end users.

---

## 9. Change Log

### 2026-08-26 — Phase 2, Batch 6 — Development phase complete, curriculum authoring paused for deployment
**Files created:**
`server/data/curriculum/days/days-51-60.json`, `DEPLOYMENT_GUIDE.md`,
`PROJECT_HANDOVER_REPORT.md`

**Files modified:**
`CURRICULUM_MAP.md` (§8 index table — Days 51–60 ✅, Days 61–90 marked
🛑 POSTPONED; §9 running vocabulary list now 342 terms; §10 batch log —
Batches 7–9 marked POSTPONED), `PROJECT_CONTINUATION.md` (this file — major
update: header, §3, §4 rewritten, new §11 added, §8 phase table rewritten)

**What changed:** Authored Days 51–60, completing the Development phase.
Day 60 built as a double milestone (Milestone 6 + Development→Advanced
capstone), following the same pattern as Day 30. 57 new vocabulary terms,
zero overlap with the 285 from Batches 1–5 (verified by validator +
independent script + a defensive per-scenario field check, given some
unusual JSON formatting introduced while writing two scenarios this batch
— confirmed harmless). **342 unique vocabulary terms across Days 1–60.**

**The user then explicitly redirected the project from continued curriculum
authoring to deployment preparation**, treating Days 1–60 as the current
scope and Days 61–90 (Batches 7–9, the Advanced phase) as postponed rather
than abandoned. Section 11 was added to this file specifically to preserve
all the Advanced-phase planning work already done (rule changes, batch
plan, exact resumption instructions) so that decision costs nothing if
curriculum work resumes later. `DEPLOYMENT_GUIDE.md` and
`PROJECT_HANDOVER_REPORT.md` were created as the primary deliverables for
this session's actual goal — see those files for deployment steps and full
project status. The phase table (§8) was rewritten to state honestly that
Phases 3–9 (the actual daily-program user experience) remain unbuilt; what's
being deployed is auth + curriculum content API + a placeholder frontend,
not a feature-complete product.

**Remaining work:** Deployment steps (git, Render, environment
configuration) — see `DEPLOYMENT_GUIDE.md`. Curriculum-wise, Batches 7–9
(Days 61–90) whenever resumed — see §11.

### 2026-08-25 — Phase 2, Batch 5
**Files created:**
`server/data/curriculum/days/days-41-50.json`

**Files modified:**
`CURRICULUM_MAP.md` (§8 index table, §9 running vocabulary list now 285
terms, §10 batch log)

**What changed:** Authored Days 41–50, continuing the Development phase
with no new rule changes — verified readings stayed consistent with
Batch 4's length (385-word average vs. 384), each still genuinely comparing
two ideas. 57 new vocabulary terms, zero overlap with the 228 from Batches
1–4 (double-verified: validator + independent script). Milestone days
confirmed at exactly 10/20/30/40/50 by script.

**Process note:** Followed the header-count sanity-check process added
after last session's two documentation errors — grepped for all
`**Batch`/`**Total` headers in CURRICULUM_MAP.md and all `### What's
completed` headers in this file immediately after each edit. Zero errors
this session, unlike the Batch 4 session. One cosmetic fix made along the
way: a tree-diagram branch marker (`└──` vs `├──`) in this file's §2 folder
structure was corrected after adding the new Batch 5 file line.

**Remaining work:** Batches 6–9 (Days 51–90). Batch 6 (Days 51–60) includes
the Day 60 Development→Advanced phase capstone — see §4 for what changes
in the Advanced phase and what Day 60 specifically needs to do.

### 2026-08-24 — Phase 2, Batch 4 — first Development-phase batch
**Files created:**
`server/data/curriculum/days/days-31-40.json`

**Files modified:**
`CURRICULUM_MAP.md` (§8 index table, §9 running vocabulary list now 228
terms + new framework-usage note, §10 batch log)

**What changed:** Authored Days 31–40, the first Development-phase batch.
Verified programmatically (not just asserted) that the phase actually
changed in the content: `phase: "development"` on all 10 days; STAR and
Problem→Cause→Solution frameworks introduced and in active use (17 distinct
framework labels now used across Days 1–40); readings averaging 384 words
vs. 290 in the Foundation phase, each genuinely comparing two valid ideas
rather than explaining one. 57 new vocabulary terms, zero overlap with the
171 from the Foundation phase (double-verified: validator + independent
script). Established a CV-safety pattern for STAR-based scenarios (Day 31)
— label the model answer as illustrative, since STAR needs a specific past
event that can't be safely invented as the user's own.

**Self-correction this session:** A large string replacement while updating
CURRICULUM_MAP.md §9 accidentally deleted Batch 3's entire vocabulary list;
caught immediately by grepping for all `**Batch` headers after the edit
rather than assuming it succeeded, and restored. The same class of error
then recurred in this file (PROJECT_CONTINUATION.md §3) — an opening bullet
line was dropped during a header rename — caught and fixed the same way.
Both are logged here, and a header-count sanity-check step has been added
to §4's instructions for the next session as a result.

**Remaining work:** Batches 5–9 (Days 41–90). Batch 5 continues the
Development phase with no new rule changes — see §4.

### 2026-08-23 — Phase 2, Batch 3 — Foundation phase complete
**Files created:**
`server/data/curriculum/days/days-21-30.json`

**Files modified:**
`CURRICULUM_MAP.md` (§8 index table — Foundation phase fully marked ✅, §9
running vocabulary list now 171 terms, §10 batch log)

**What changed:** Authored Days 21–30, completing the Foundation phase.
Day 30 built as a double milestone — Milestone 3 in the regular pattern,
plus the Foundation→Development phase capstone, with reading/reflection/
speaking content that explicitly synthesizes across all 30 days and previews
the Development phase's changes (STAR framework, longer/more ambiguous
content). 57 new vocabulary terms, zero overlap with the 114 from Batches
1–2 (verified by `validateCurriculum.js` across all 30 days, 0 errors/0
warnings). Also corrected a documentation bug from the prior session: the
"What's completed" section had been describing only Batch 1 under a header
that claimed to cover Batches 1–2 — fixed to accurately describe both.

**Remaining work:** Batches 4–9 (Days 31–90). Batch 4 is materially
different from Batches 1–3 — it's the first Development-phase batch, which
introduces the STAR framework and allows longer, more ambiguous content.
See §4 for full detail on what changes.

### 2026-08-23 — Phase 2, Batch 2
**Files created:**
`server/data/curriculum/days/days-11-20.json`

**Files modified:**
`CURRICULUM_MAP.md` (§8 index table, §9 running vocabulary list now 114
terms, §10 batch log)

**What changed:** Authored Days 11–20 — same structure and quality bar as
Batch 1, content deepened within the same Foundation-tier domains rather
than repeated. 57 new vocabulary terms, zero overlap with Batch 1 (verified
by `validateCurriculum.js` across all 20 days, 0 errors/0 warnings). Word
counts computed programmatically from actual text, not estimated.

**Remaining work:** Batches 3–9 (Days 21–90) — see §4 for the exact next
step (Batch 3, Days 21–30, including the Day 30 phase capstone). Phases
3–10 unchanged.

### 2026-08-22 — Phase 2, Batch 1
**Files created:**
`CURRICULUM_MAP.md`, `server/models/DailyProgram.js`,
`server/models/VocabularyTerm.js`,
`server/data/curriculum/days/days-01-10.json`,
`server/scripts/validateCurriculum.js`, `server/scripts/seedCurriculum.js`,
`server/controllers/programController.js`, `server/routes/programRoutes.js`

**Files modified:**
`server/app.js` (mounted `programRoutes` at `/api/program`),
`server/package.json` (added `validate:curriculum` and `seed` npm scripts)

**What changed:** Built the curriculum data layer end to end: models, a
structural validator (run and passing clean against Batch 1), a seed script
(written and ready, deliberately not executed against a live DB yet), and
the first read API endpoint. Fully authored Days 1–10 — original readings,
tongue twisters, reflection questions, speed-reading passages with verified
word counts, 57 unique vocabulary terms, and 20 speaking scenarios with
CV-safe model answers. Established CURRICULUM_MAP.md as the structural plan
all future batches must follow (spiral curriculum, 10-day domain rotation,
milestone-day rule, no-repeat vocabulary rule).

**Remaining work:** Batches 2–9 (Days 11–90) — see §4 for the exact next
step (Batch 2, Days 11–20). Phases 3–10 unchanged from before.

### 2026-08-22 — Phase 1
**Files created:**
`package.json`, `.gitignore`, `.env.example`, `README.md`,
`PROJECT_CONTINUATION.md`, `server/package.json`, `server/server.js`,
`server/app.js`, `server/models/User.js`, `server/controllers/authController.js`,
`server/middleware/requireAuth.js`, `server/middleware/errorHandler.js`,
`server/middleware/validateRequest.js`, `server/routes/authRoutes.js`,
`server/routes/healthRoutes.js`, `server/utils/logger.js`,
`server/utils/asyncHandler.js`, `client/package.json`, `client/vite.config.js`,
`client/index.html`, `client/src/main.jsx`, `client/src/App.jsx`

**What changed:** Initial implementation. Full auth foundation (register,
login, logout, me) plus the repo scaffold and health check needed to make it
runnable/deployable. Minimal client scaffold created for folder-structure
consistency; no frontend pages/UI built yet.

**Remaining work:** Everything in Phases 2–10 (see §8). Immediate next step
is documented in §4.

---

## 10. Recovery / Continuation Procedure

When your current AI session/chat reaches its limit:

1. Download the full project — either the individual files or the provided ZIP archive.
2. Start a new AI chat session.
3. Upload the project ZIP (or the key files, at minimum this
   `PROJECT_CONTINUATION.md`) to the new session.
4. Tell the new AI explicitly: *"Read PROJECT_CONTINUATION.md and continue
   this project from the recorded state. Do not restart from scratch."*
5. Let the new AI inspect the actual uploaded files before it writes anything
   — the file contents are the ground truth, this document is a guide to them.
6. Do not let the new AI overwrite or redesign working functionality (Phase 1
   auth, in particular) without a clearly stated, strong reason.
7. At the end of the new session's work, ask it to update this file (status,
   next step, phase table, change log) and provide a fresh downloadable
   project (files + zip) before you end that session too.

---

## 11. Postponed Roadmap (Days 61–90) — the Advanced Phase

**Status: not started, not abandoned.** The user decided in the Batch 6
session to take the project to deployment with Days 1–60 as the current
scope, rather than continue immediately into Days 61–90. Everything below
is the plan that Batches 7–9 would follow if and when curriculum authoring
resumes — it's preserved here in full so that decision doesn't cost any of
the planning work already done, and so a future session (AI or human) can
resume without re-deriving the Advanced phase's rules from scratch.

### What the Advanced phase changes (per the original blueprint + CURRICULUM_MAP.md §4)

Day 60's own reading and speaking scenarios already previewed this shift
in-content — see `days-51-60.json` — but the concrete rule changes are:

- **Tongue twisters** move beyond Development's "longer, complex phrases"
  tier to **"advanced articulation and professional speaking warm-ups"** —
  full, complete, complex professional sentences practiced for clarity and
  pace, not isolated sound-pattern phrases. This is a bigger jump than
  Foundation→Development was.
- **Frameworks**: PREP, STAR, and Problem→Cause→Solution remain available,
  but scenarios should increasingly **not name a framework in advance**,
  closer to how an actual unprepared question arrives. Executive/persuasive
  framing becomes an explicit focus, building on Day 51's BLUF/register/
  gravitas vocabulary and Day 60's spontaneity/gravitas/calibration terms.
- **Speaking scenarios** shift toward: full mock-interview or
  mock-presentation style content, genuinely spontaneous/unprepared
  questions, executive-style concision under time pressure, and situations
  with real ambiguity rather than a clean two-sided comparison (Development
  phase's signature move — Advanced can still use comparisons, but should
  also include scenarios with messier, more-than-two-sided real situations).
- **Readings** can be as long or longer than Development's ~370–420 word
  average, and can address more ambiguous or higher-stakes situations.
- **Domain rotation** stays the same 10-day pattern (Day 61/71/81 =
  Communication foundations, Day 62/72/82 = Procurement, ... Day 70/80/90 =
  Milestone, with **Day 90 as the full program capstone** — treat it as a
  bigger deal than Day 60 was, the same way Day 60 was bigger than Day 30).
- **Vocabulary**: 171 terms would be needed for Batches 7–9 (57 × 3),
  none overlapping the 342 already used in Days 1–60 (full list in
  CURRICULUM_MAP.md §9).

### Batch-by-batch plan (unchanged from original planning, just not yet executed)

| Batch | Days | Focus |
|---|---|---|
| 7 | 61–70 | First Advanced batch — re-read CURRICULUM_MAP.md §4's Advanced column in full before writing anything, the same way Batch 4's session had to internalize Development's rules first. Day 70 = Milestone 7. |
| 8 | 71–80 | Same rotation, greater depth within the Advanced tier. Day 80 = Milestone 8. |
| 9 | 81–90 | Same rotation. **Day 90 = full program capstone** — should synthesize across all 90 days, not just Days 81–89, and give the user a genuine sense of completion/graduation from the program. |

### Exact instructions to resume (whenever that happens)

1. Read this entire §11, then CURRICULUM_MAP.md in full (especially §4's
   Advanced column and the full §9 term list), then open `days-51-60.json`
   as a structural reference for the JSON shape — the shape doesn't change,
   only the content rules above do.
2. Author `server/data/curriculum/days/days-61-70.json` following the same
   pipeline used for every batch so far: write content → compute
   `speedReading.wordCount`/`reading.estimatedMinutes` programmatically →
   run `node server/scripts/validateCurriculum.js` → run an independent
   duplicate/phase/milestone check via a small Node script → update
   CURRICULUM_MAP.md (§8, §9, §10) and this file (§3, §4, §8, §9) using
   **small targeted edits with a post-edit header-count grep check**, not
   large block replacements.
3. Give whichever AI session does this the instruction: *"Read
   PROJECT_CONTINUATION.md §11 in full, then CURRICULUM_MAP.md, then author
   Batch 7 (Days 61–70, the first Advanced-phase batch) following §11's
   rules exactly."*

### Why this is safe to postpone

Nothing about deployment (Phase 3 onward: `DailyProgress`, the daily UI,
Gemini integration, hosting) depends on Days 61–90 existing. The
`DailyProgram` model, `seedCurriculum.js`, and `/api/program/day/:dayNumber`
all already work against however many days currently exist in
`server/data/curriculum/days/` — seeding 60 days today and adding 30 more
later requires no code change, just re-running `seedCurriculum.js` (which
is idempotent — see its own header comment) once the additional batches
exist. A user progressing through the program day by day simply wouldn't
have Day 61 available until this work resumes.
