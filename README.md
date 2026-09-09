# easyEd

Lesson planning for private teachers and schools — scheme books and lesson
plans in one place, with role-based staff management for schools.

Full-stack Next.js (App Router) app: the frontend and all API logic
(Route Handlers under `src/app/api`) live in one project, backed by MongoDB
via Mongoose. Authentication is custom-built (bcrypt + JWT in an `httpOnly`
cookie) — no third-party auth provider.

## Tech stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS
- MongoDB via Mongoose, with a serverless-friendly connection cache
- TanStack Query (React Query v5) for all client-side data fetching
- Zod for request validation, bcryptjs + jsonwebtoken for auth
- Resend for transactional email (falls back to console logging in dev)
- Vitest + mongodb-memory-server for tests

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and fill in values (see table below):
   ```bash
   cp .env.example .env.local
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
   The app runs at [http://localhost:3000](http://localhost:3000). If that
   port is already in use, Next.js will pick the next free one and print the
   actual URL to the terminal.
4. (Optional) Seed the database with sample data — see [Seeding](#seeding)
   below.

## Environment variables

All variables are listed in `.env.example`. None of the `NEXT_PUBLIC_*`
variables contain secrets; everything else is server-only.

| Variable | Required | Where to get it |
| --- | --- | --- |
| `MONGODB_URI` | Yes | A MongoDB connection string. For local development, either run MongoDB locally (`mongodb://127.0.0.1:27017/easyed`) or create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and copy its connection string. |
| `JWT_SECRET` | Yes | Generate a random 64+ character string yourself: `openssl rand -hex 64`. Do not reuse this across environments. |
| `JWT_EXPIRY_DAYS` | No (default `7`) | How long a session cookie stays valid. |
| `RESEND_API_KEY` | No | From [resend.com](https://resend.com) if you want real emails sent. Without it, invite/reset/OTP emails are logged to the server console instead of sent — fine for local development. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | No | Alternative to Resend if you'd rather wire up `lib/email.ts` to an SMTP provider (Nodemailer). Not implemented by default — see [Assumptions](#assumptions--ambiguities). |
| `EMAIL_FROM` | No | The "from" address used on outgoing emails. |
| `NEXT_PUBLIC_APP_URL` | Yes | The app's own URL, used to build invite/reset links (e.g. `http://localhost:3000` locally, `https://app.easyed.co` in production). |
| `INVITE_TOKEN_EXPIRY_HOURS` | No (default `72`) | How long a staff invite link is valid. |
| `OTP_EXPIRY_MINUTES` | No (default `15`) | How long an invite-acceptance OTP code is valid. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | No | From [upstash.com](https://upstash.com) for distributed rate limiting in production (multiple server instances). Without these, rate limiting falls back to an in-process counter, which is fine for a single instance/local dev but resets on every server restart and doesn't share state across instances. |

**Never commit real values for these into `.env.example`** — it's a
template and (unlike `.env.local`) is tracked in git.

## Seeding

```bash
npm run seed
```

Creates:

- A **school account** ("Riverside Academy") with a super admin user, the
  three seeded roles (Super Admin, Academic Head, Teacher), and one staff
  member in `invited` status. The invite link is printed to the console
  (since no email provider is configured by default).
  - Super admin login: `admin@riverside.example` / `SchoolAdmin123!`
- A **private teacher account** ("Jordan Teacher") with one scheme book (3
  weeks) and one lesson plan pulled from the first week.
  - Login: `teacher@example.com` / `PrivateTeacher123!`

The script wipes all collections before seeding, so it's safe to re-run.

## Tests

```bash
npm run test
```

Runs the Vitest suite against a real (in-memory) MongoDB instance via
`mongodb-memory-server` — no external database needed. Coverage includes:

- `checkPermission` / `resolvePermissions` (`tests/lib/permissions.test.ts`)
- Login route: correct credentials, wrong password, invited-user block
  (`tests/routes/login.test.ts`)
- Invite acceptance: valid OTP, expired OTP, already-used token
  (`tests/routes/invite.test.ts`)
- Scheme CRUD + tenant isolation (`tests/routes/schemes.test.ts`)
- Lesson CRUD + validation errors (`tests/routes/lessons.test.ts`)

## Project structure

```
src/
  app/
    api/            Route Handlers — all business logic entry points
    (auth)/          Public pages (sign-in, sign-up, invite acceptance, ...)
    (app)/           Authenticated pages (session-guarded layout)
  components/        Shared, reusable UI (buttons, inputs, toasts, ...)
  features/          Domain UI: auth, scheme-book, lesson-plan, staff, roles
  lib/               Cross-cutting utilities (db, jwt, permissions, email, ...)
  models/            Mongoose schemas
  repositories/       Data access — the only layer that imports Mongoose models
  services/           Business logic — calls repositories only
  validators/         Zod schemas for request bodies
  hooks/              TanStack Query hooks, one file per domain
  types/              Shared TypeScript interfaces
scripts/seed.ts        Seed script (see above)
tests/                 Vitest suite + mongodb-memory-server setup helpers
```

Layering is enforced throughout: Route Handlers call services, services call
repositories, repositories call Mongoose models — nothing skips a layer.

## Assumptions & ambiguities

Where the spec was open to interpretation, these choices were made:

- **Next.js version**: the spec asked for "14+"; `create-next-app@latest`
  installed Next 16, which satisfies that and is what's actually current.
  Turbopack is used for dev/build (Next's current default).
- **SMTP path is scaffolded but not wired up**: `lib/email.ts` sends via
  Resend when `RESEND_API_KEY` is set, and otherwise logs to the console.
  The `SMTP_*` variables are documented in `.env.example` as an alternative
  per the spec, but no Nodemailer transport is implemented — swap it in
  behind `sendEmail()` if you need it.
- **Two additional endpoints not in the spec's API list, needed to fulfill
  the described UX**:
  - `GET /api/invites/[token]` — lets the accept-invite page show the
    invitee's email address before they verify, as the spec's UX
    description requires ("show invited email address (read from token)").
  - `GET /api/schemes/week-options` — powers the lesson editor's
    "pull from scheme" searchable dropdown, which needs a flat list of every
    scheme week the account can see across all schemes.
  - `PATCH /api/auth/me`, `POST /api/auth/change-password`, and
    `PATCH /api/account` — the spec's `/settings` page needs endpoints to
    update display name, change password, and rename the account, but none
    were listed in section 7's API surface.
- **Scheme/lesson creation UX**: the spec lists `/schemes/[id]` and
  `/lessons/[id]` as the editor routes but no `/schemes/new` or
  `/lessons/new`. Creation happens via a small modal from the respective
  list page (collecting the required header fields), which then redirects
  into the `[id]` editor to fill in the rest — this keeps one editor per
  entity type instead of a separate create flow.
- **Scheme week / lesson plan free-text fields are optional at the database
  level** (`theme`, `competency`, `teacherActivities`, `materials`, etc.),
  defaulting to `""`. The spec's data-modeling section says every field
  should have an explicit, non-optional `required`/`type` — but a newly
  added week row or a lesson plan mid-draft must be saveable before every
  field is filled in (per the "Add week" / explicit-Save UX), so these
  particular fields use `required: false, default: ''` rather than
  `required: true`. Identity and structural fields (`week`, `date`, `klass`,
  `subject`, `topic`, `duration`, `numLearners`) remain required.
- **Rate limiting** uses `@upstash/ratelimit` when `UPSTASH_REDIS_REST_URL`
  / `UPSTASH_REDIS_REST_TOKEN` are set, and an in-process sliding-window
  counter otherwise (per the spec's fallback allowance). The in-process
  fallback is per-server-instance and resets on restart — fine for local
  dev or a single instance, not sufficient alone for a multi-instance
  production deployment.
- **`npm audit` currently reports 3 high-severity findings**, all transitive
  dependencies bundled inside `next` itself (`postcss`, `sharp`). The only
  "fix" `npm audit fix --force` offers is downgrading Next to `9.3.3`, which
  is not a real fix. Accepted as-is; revisit when upstream Next.js patches
  its bundled deps.
- **CSP allows `'unsafe-inline'`** for scripts and styles (Next.js injects
  inline hydration data without a nonce by default) and additionally
  `'unsafe-eval'` in development only (React dev-mode debugging tools use
  `eval()`; this is stripped from the production policy).
