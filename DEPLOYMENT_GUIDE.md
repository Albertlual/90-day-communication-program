# DEPLOYMENT_GUIDE.md

A complete, step-by-step guide to take this project from a downloaded ZIP
to a live, working application on the internet. Follow the steps in order.
Every command shown is meant to be copied and run exactly as written,
except where a placeholder like `<your-value-here>` is shown — replace
those with your own real values.

**What you'll end up with:** a live URL (something like
`https://your-app-name.onrender.com`) where the backend API is running,
connected to a real MongoDB database, with 60 days of curriculum content
loaded and ready to be served.

**What this does NOT include yet:** a user-facing daily-program screen.
This deployment exposes working authentication and a content API — the
actual "click through your daily lesson" interface hasn't been built yet
(see `PROJECT_HANDOVER_REPORT.md` for exactly what is and isn't built).
That's fine — this guide gets the current, real state of the project onto
the internet correctly, which is a normal and useful checkpoint.

---

## Part 1 — Prerequisites

Install these once, before doing anything else. If you already have them,
skip ahead.

| Tool | What it's for | Where to get it |
|---|---|---|
| **Node.js** (v18 or newer) | Runs the server and builds the client | https://nodejs.org — download the "LTS" version |
| **Git** | Version control, needed to push to a repository | https://git-scm.com/downloads |
| **VS Code** | The code editor you'll use | https://code.visualstudio.com |
| **A GitHub account** (free) | Hosts your code repository | https://github.com/join |
| **A MongoDB Atlas account** (free) | Hosts your database | https://www.mongodb.com/cloud/atlas/register |
| **A Render account** (free tier available) | Hosts your live application | https://render.com |

To check Node and Git installed correctly, open any terminal and run:

```bash
node -v
git --version
```

You should see version numbers printed, not an error.

---

## Part 2 — Open the Project in VS Code

1. Unzip the project folder you received (e.g., `90-day-comm-program.zip`)
   somewhere on your computer, such as your Desktop or a `Projects` folder.
2. Open VS Code.
3. Go to **File → Open Folder...** and select the unzipped `90-day-comm-program`
   folder (the one containing `package.json`, `client/`, `server/`, etc.).
4. VS Code will open with the project's file tree visible on the left.

### Opening the terminal in VS Code

You'll run all commands in this guide through VS Code's built-in terminal.

- Go to **Terminal → New Terminal** in the top menu (or press `` Ctrl+` ``
  on Windows/Linux, `` Cmd+` `` on Mac).
- A terminal panel opens at the bottom, already pointed at your project
  folder. Every command below assumes you're running it from this terminal,
  from the project's root folder (the one with `package.json` in it) unless
  a step says otherwise.

---

## Part 3 — Install Dependencies

Run this once, from the project root:

```bash
npm run install:all
```

This installs the packages needed for both the server and the client. It
may take a minute or two. You'll see a lot of text scroll by — that's
normal. If it finishes without a red "error" message at the end, it worked.

---

## Part 4 — Configure Environment Variables

The application needs several secret/configuration values that are never
committed to the code. These live in a file called `.env` in the project
root, which you'll create now.

### 4.1 — Create your `.env` file

In the terminal, from the project root:

```bash
cp .env.example .env
```

(On Windows Command Prompt, use `copy .env.example .env` instead.)

Open the new `.env` file in VS Code (click it in the file tree on the
left) and fill in the real values as described below.

### 4.2 — Set up MongoDB and get your connection URL

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Once logged in, click **Build a Database** and choose the **free (M0)**
   tier. Pick any cloud provider/region (the closest to you is fine).
3. When asked to create a database user, set a username and a strong
   password. **Write these down** — you'll need them in a moment. Avoid
   special characters like `@` or `/` in the password, since they can
   break the connection string; if you must use one, note it so you can
   URL-encode it later.
4. Under **Network Access**, click **Add IP Address** and choose
   **Allow Access from Anywhere** (`0.0.0.0/0`). This is required because
   Render's free/shared tier doesn't provide a fixed outbound IP address.
   Security here relies on your strong database password, not IP
   restriction — don't reuse that password anywhere else.
5. Once your cluster is created (this takes a minute or two), click
   **Connect** on your cluster, choose **Drivers**, and copy the connection
   string shown. It looks like:

   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. Replace `<username>` and `<password>` with the real database user
   credentials you created in step 3. Add a database name right after
   `.mongodb.net/` and before the `?`, so it looks like:

   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/90-day-program?retryWrites=true&w=majority
   ```

7. Paste this full string as the value of `MONGODB_URI` in your `.env` file:

   ```
   MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/90-day-program?retryWrites=true&w=majority
   ```

### 4.3 — Generate a JWT secret

This is a random string used to sign login sessions. Generate one by
running this in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the long string it prints and paste it as the value of `JWT_SECRET`
in your `.env` file:

```
JWT_SECRET=<paste the long random string here>
```

### 4.4 — The rest of the `.env` file

For local testing, the remaining values can stay as they are in
`.env.example`:

```
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
GEMINI_API_KEY=
```

`GEMINI_API_KEY` is not required yet — Gemini integration hasn't been built
into the application (see `PROJECT_HANDOVER_REPORT.md`). Leave it blank.

Your finished `.env` should have real values for `MONGODB_URI` and
`JWT_SECRET`, and the defaults for everything else. **Never commit this
file or share it** — it's already listed in `.gitignore` so Git will
ignore it automatically.

---

## Part 5 — Load the Curriculum Content Into Your Database

The 60 days of curriculum content live as six JSON files in
`server/data/curriculum/days/` (`days-01-10.json` through `days-51-60.json`
— **all six together, Days 1 through 60**). They are not yet in your
database. Before testing, load them in:

```bash
node server/scripts/validateCurriculum.js
```

This checks the content is structurally correct — it does not need a
database connection. You should see:

```
✓ All curriculum files passed validation.
```

Note the count reported here: **"Validated 60 day(s) across 6 file(s)."**
That's your confirmation all six batches are being read together, not just
the most recently added one.

Then, with your `.env` file's `MONGODB_URI` filled in, run:

```bash
node server/scripts/seedCurriculum.js
```

This connects to your MongoDB database and loads **every day from every
file in that folder — Days 1 through 60 in one run**, plus the vocabulary
terms, into it. There is no way to seed only one batch; the script reads
the entire directory every time it runs. It's also safe to run more than
once — it updates existing content rather than duplicating it. You should
see log lines ending with something like:

```
Seed complete { filesProcessed: [...], daysSeededThisRun: 60, totalDailyProgramDocs: 60, totalVocabularyTermDocs: 342 }
```

If `daysSeededThisRun` doesn't say `60`, something is wrong — check that
all six files listed above are actually present in
`server/data/curriculum/days/` before re-running.

---

## Part 6 — Test the Application Locally

Open **two** terminal tabs/panels in VS Code (click the `+` icon in the
terminal panel to open a second one).

**In the first terminal**, start the backend:

```bash
npm run dev:server
```

You should see:

```
[INFO] ... - MongoDB connected
[INFO] ... - Server running on port 5000 (development)
```

**In the second terminal**, start the frontend:

```bash
npm run dev:client
```

You should see a message with a local URL, typically `http://localhost:5173`.

### Verify it's working

With the server running, open a **third** terminal (or use your browser)
and check the health endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected response: `{"status":"ok","db":"connected", ...}`

Try registering a user:

```bash
curl -c cookies.txt -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

You should get back a 201 response with a user object. Then try fetching a
day of curriculum content (you'll need to be logged in — the cookie from
registration above handles that):

```bash
curl -b cookies.txt http://localhost:5000/api/program/day/1
```

You should see Day 1's full content (tongue twister, reading, vocabulary,
etc.) as JSON. If you see this, your local setup is fully working.

Open `http://localhost:5173` in your browser to see the placeholder
frontend page confirming the client is running too.

---

## Part 7 — Push the Project to GitHub

Git has already been initialized in this project with an initial commit
already made. You just need to connect it to a GitHub repository and push.

### 7.1 — Create a new repository on GitHub

1. Go to https://github.com/new
2. Name it something like `90-day-comm-program`.
3. Leave it **empty** — do NOT check "Add a README" or any other
   initialization option, since this project already has its own files
   and history.
4. Click **Create repository**.
5. GitHub will show you a page with a repository URL, something like:
   `https://github.com/your-username/90-day-comm-program.git`

### 7.2 — Connect and push

Back in VS Code's terminal, from the project root:

```bash
git remote add origin https://github.com/your-username/90-day-comm-program.git
git push -u origin main
```

Replace the URL with your actual repository URL from step 7.1. You'll be
prompted to authenticate with GitHub (a browser window may open, or you'll
need a personal access token depending on your Git setup — GitHub's own
prompts will guide you through this if it's your first time).

Once it finishes, refresh your GitHub repository page in a browser — you
should see all your project files there.

### If you make changes later

Any time you edit files and want to save/push the changes:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

---

## Part 8 — Deploy on Render

1. Go to https://render.com and sign in (you can sign in with your GitHub account directly).
2. Click **New +** → **Web Service**.
3. Connect your GitHub account if you haven't already, then select your
   `90-day-comm-program` repository from the list.
4. Fill in the service settings:

   | Setting | Value |
   |---|---|
   | **Name** | anything you like, e.g. `90-day-comm-program` |
   | **Region** | closest to you or your users |
   | **Branch** | `main` |
   | **Root Directory** | leave blank (the project root) |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free (or a paid tier if you want to avoid cold starts) |

5. Under **Environment Variables**, add each of these (click "Add
   Environment Variable" for each one):

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | the same connection string from Part 4.2 |
   | `JWT_SECRET` | the same value you generated in Part 4.3 |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | leave blank or set to your Render URL once you know it (see note below) |
   | `GEMINI_API_KEY` | leave blank — not needed yet |

   **Note on `PORT`:** don't set this — Render provides it automatically,
   and the server already reads `process.env.PORT` with a fallback.

   **Note on `CLIENT_URL`:** since this is a single-service deployment
   (Express serves the built frontend), `CLIENT_URL` mainly matters for
   local development CORS. You can leave it unset for production, or set
   it to your Render URL once Render assigns one (e.g.,
   `https://90-day-comm-program.onrender.com`) — you can add/edit
   environment variables and redeploy at any time.

6. Click **Create Web Service**.

Render will now pull your code, run the build command, and start the
service. This takes a few minutes the first time.

---

## Part 9 — Check the Deployment

### Watch the logs

On your service's Render dashboard page, click the **Logs** tab. You
should see output similar to your local terminal:

```
==> Building...
... npm install and vite build output ...
==> Build successful
==> Starting service with 'npm start'
[INFO] ... - MongoDB connected
[INFO] ... - Server running on port 10000 (production)
==> Your service is live
```

### Verify the live application

Render will show your live URL at the top of the dashboard, something like
`https://90-day-comm-program.onrender.com`. Test it:

```bash
curl https://90-day-comm-program.onrender.com/api/health
```

Expected: `{"status":"ok","db":"connected", ...}` — if `db` says
`"disconnected"`, see Troubleshooting below.

Test registration against the live URL the same way you did locally:

```bash
curl -c cookies.txt -X POST https://90-day-comm-program.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"livetest@example.com","password":"password123"}'
```

### Seed the production database

If you haven't already run `seedCurriculum.js` against this same
`MONGODB_URI` (you may have already done this locally in Part 5, pointing
at the same database — if so, you can skip this), run it now from your
local machine, since it connects directly to your MongoDB Atlas database
regardless of where the app itself is hosted:

```bash
node server/scripts/seedCurriculum.js
```

Then verify content is reachable through the live app:

```bash
curl -b cookies.txt https://90-day-comm-program.onrender.com/api/program/day/1
```

If this returns Day 1's content, your deployment is fully working end to end.

---

## Troubleshooting

**"Missing required environment variables" in the logs, service won't start**
You forgot to set `MONGODB_URI` or `JWT_SECRET` in Render's Environment
Variables tab. Add them and Render will automatically redeploy.

**Health check shows `"db":"disconnected"`**
Usually means your `MONGODB_URI` is wrong, or your MongoDB Atlas Network
Access settings don't allow connections from Render. Double-check:
- The username/password in the connection string are correct (no
  leftover `<` `>` brackets, no unencoded special characters in the password).
- Atlas Network Access has `0.0.0.0/0` allowed (Part 4.2, step 4).
- The database name in the URI matches what you intended.

**Build fails on Render with a client build error**
Run `npm run build` locally first (from the project root) to confirm it
works on your machine. If it works locally but fails on Render, check the
Render build logs for the specific npm error — it's often a Node version
mismatch. You can pin a Node version for Render by adding an `"engines"`
field to the root `package.json`, e.g. `"engines": { "node": ">=18" }`.

**App is live but every page/route returns a blank screen or 404**
Confirm `NODE_ENV=production` is actually set in Render's environment
variables — the server only serves the built frontend and handles
client-side routing fallback when this is set correctly.

**First request after inactivity is very slow**
This is expected on Render's free tier — the service "spins down" after a
period of no traffic and takes 30-60 seconds to wake up on the next
request. This isn't a bug. Upgrade to a paid instance type if this is a
problem for real users.

**Registering or logging in works locally but not on the deployed site, or vice versa**
Cookies are scoped to the domain/protocol they were set on. A cookie set
by `localhost:5000` won't be sent to your Render URL, and vice versa — this
is expected; log in again against whichever environment you're testing.

**"CORS error" in the browser console**
This shouldn't happen in the single-service production setup, since the
frontend and API share the same origin. If you see this, confirm you
haven't accidentally deployed the frontend separately from the backend
(this guide's setup deploys both together as one service).

**`npm audit` shows vulnerabilities**
Two dev-only advisories remain in the client's dependencies (Vite's dev
server and a related toolchain package) — see `PROJECT_HANDOVER_REPORT.md`
for the specific advisory and why it doesn't affect the production build.
They do not affect the deployed application, only your local
`npm run dev:client` session.

---

## Quick Reference: All Commands in Order

```bash
# One-time setup
npm run install:all
cp .env.example .env
# (edit .env with your MongoDB URI and JWT secret)
node server/scripts/validateCurriculum.js
node server/scripts/seedCurriculum.js

# Local testing (two terminals)
npm run dev:server
npm run dev:client

# Push to GitHub
git remote add origin https://github.com/your-username/90-day-comm-program.git
git push -u origin main

# On Render: create Web Service pointing at your repo, with:
#   Build Command: npm install && npm run build
#   Start Command: npm start
#   Env vars: MONGODB_URI, JWT_SECRET, NODE_ENV=production
```
