# Multi-Tenant Feature Flag Management System

A SaaS-like feature flag management system with three separate front-end applications and a shared Node.js backend. Built as a monorepo using Turborepo and pnpm workspaces.

## Architecture Overview

```
auth-practices/
├── apps/
│   ├── server/              # Node.js API server (Hono on port 3000)
│   └── web/
│       ├── super-admin/     # Super Admin UI (port 3001)
│       ├── admin/           # Organisation Admin UI (port 3002)
│       └── user/            # End User UI (port 3003)
└── packages/
    ├── api/                 # Hono route handlers and middleware
    ├── db/                  # Drizzle ORM schema, migrations, and client
    ├── rpc/                 # Type-safe Hono RPC client (shared across frontends)
    ├── env/                 # Environment variable validation (t3-env)
    ├── ui/                  # Shared shadcn/ui component library
    └── config/              # Shared TypeScript config
```

## Tech Stack

| Layer      | Technology                                           |
|------------|------------------------------------------------------|
| Backend    | Node.js, [Hono](https://hono.dev/)                   |
| Frontend   | React 19, Vite, TanStack Router, TanStack Query      |
| Database   | SQLite via [Turso](https://turso.tech/) (libSQL)     |
| ORM        | [Drizzle ORM](https://orm.drizzle.team/)             |
| Auth       | Custom JWT (jsonwebtoken) + HTTP-only cookies        |
| Styling    | Tailwind CSS v4, shadcn/ui                           |
| Monorepo   | Turborepo + pnpm workspaces                          |
| Validation | Zod (shared between frontend and backend)            |

## System Roles

### 1. Super Admin
- Static credentials configured via environment variables (`SUPER_ADMIN` / `SUPER_ADMIN_PASS`)
- Can log in, create organisations, and view a paginated list of organisations
- JWT stored in `sa_a_tk` HTTP-only cookie

### 2. Organisation Admin (`ORG_ADMIN`)
- Signs up using an organisation code (issued by Super Admin)
- Manages feature flags scoped to their organisation (create, update, enable/disable, delete)
- JWT stored in `a_a_tk` HTTP-only cookie

### 3. End User (`ORG_USER`)
- Signs up using an organisation code
- Can check whether a specific feature flag is enabled for their organisation
- JWT stored in `u_a_tk` HTTP-only cookie

## Data Model

```sql
organizations   id, code (unique), name, created_at
roles           id, role ("ORG_ADMIN" | "ORG_USER")
users           id, email, name, password (bcrypt), organization_id, role_id, created_at
feature_flags   id, organization_id, feature_key (unique), is_enabled, created_at
```

Foreign keys cascade delete from `organizations` to `users` and `feature_flags`.

## API Routes

All routes are prefixed by role namespace. CORS is restricted per namespace origin.

### Super Admin — `/super-admin`
| Method | Path              | Auth | Description                    |
|--------|-------------------|------|--------------------------------|
| POST   | `/login`          | —    | Static credential login        |
| GET    | `/introspect`     | ✓    | Verify session                 |
| POST   | `/create-org`     | ✓    | Create a new organisation      |
| GET    | `/get-orgs-list`  | ✓    | Paginated list of organisations|

### Admin — `/admin`
| Method | Path                         | Auth | Description                       |
|--------|------------------------------|------|-----------------------------------|
| POST   | `/sign-up`                   | —    | Register as org admin              |
| POST   | `/sigin-in`                  | —    | Login                             |
| GET    | `/introspect`                | ✓    | Verify session                    |
| POST   | `/create-feature-flag`       | ✓    | Create a feature flag             |
| GET    | `/get-feature-flags`         | ✓    | Paginated list of flags           |
| PATCH  | `/update-feature-flag/:id`   | ✓    | Update key or enabled state       |
| DELETE | `/delete-feature-flag/:id`   | ✓    | Delete a feature flag             |

### User — `/user`
| Method | Path                    | Auth | Description                            |
|--------|-------------------------|------|----------------------------------------|
| POST   | `/sign-up`              | —    | Register as end user                   |
| POST   | `/sigin-in`             | —    | Login                                  |
| GET    | `/introspect`           | ✓    | Verify session                         |
| GET    | `/feature/check/:key`   | ✓    | Check if a feature is enabled for org  |

## Authentication Design

- **No third-party auth providers.** All auth is custom-built.
- Passwords are hashed with `bcryptjs` (10 rounds).
- On login/signup, a JWT is signed with a server secret and set as an **HTTP-only, SameSite=Strict** cookie.
- Three separate cookie names (`sa_a_tk`, `a_a_tk`, `u_a_tk`) isolate sessions by role.
- Middleware verifies the cookie, decodes the JWT, and enforces the correct role before any protected route handler runs.
- Organisation scoping: every resource write/read is tied to the `organization_id` derived from the authenticated user — admins can only manage flags for their own org, and users can only check flags within their org.

## Frontend Applications

All three frontends share:
- The `@auth-practices/rpc` package for type-safe API calls via Hono's RPC client
- The `@auth-practices/ui` shared component library
- TanStack Router for file-based routing and TanStack Query for server state

### Super Admin (`apps/web/super-admin` — port 3001)
- Login page
- Dashboard: paginated organisations table with an "Add Organisation" dialog

### Admin (`apps/web/admin` — port 3002)
- Sign up / Sign in pages (require an org code)
- Dashboard: paginated feature flags table with create, toggle enable/disable, and delete actions

### User (`apps/web/user` — port 3003)
- Sign up / Sign in pages (require an org code)
- Dashboard: input field for a feature key + submit button that shows whether the feature is enabled or disabled for the user's organisation

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 10+

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example and fill in your values.

#### Option A — Local SQLite (no Turso account needed)

`@libsql/client` supports local SQLite files natively via the `file:` scheme — no Turso CLI or external server required.

**`apps/server/.env`**
```env
DATABASE_URL=file:local.db
DATABASE_AUTH_TOKEN=
SECRET=<random-secret-for-jwt>
SUPER_ADMIN="NAME"
SUPER_ADMIN_PASS="PASSWORD"
SUPER_ADMIN_CORS_ORGIN=http://localhost:3001
ADMIN_CORS_ORGIN=http://localhost:3002
USER_CORS_ORGIN=http://localhost:3003
NODE_ENV=development
```

The `local.db` file will be created automatically in the working directory the first time you run the server.

#### Option B — Turso cloud

Create a database at [turso.tech](https://turso.tech), copy the URL and auth token, then:

**`apps/server/.env`**
```env
DATABASE_URL=libsql://<your-turso-db-url>
DATABASE_AUTH_TOKEN=<your-turso-auth-token>
SECRET=<random-secret-for-jwt>
SUPER_ADMIN="NAME"
SUPER_ADMIN_PASS="PASSWORD"
SUPER_ADMIN_CORS_ORGIN=http://localhost:3001
ADMIN_CORS_ORGIN=http://localhost:3002
USER_CORS_ORGIN=http://localhost:3003
NODE_ENV=development
```

Each frontend (`apps/web/super-admin`, `apps/web/admin`, `apps/web/user`) needs a `.env` with:
```env
VITE_SERVER_URL=http://localhost:3000
```

### 3. Run database migrations

```bash
pnpm db:migrate
```

### 4. Seed roles

```bash
pnpm db:seed
```

This inserts the two required roles: `ORG_ADMIN` and `ORG_USER`.

### 5. Start development servers

```bash
pnpm dev
```

Turborepo starts all apps concurrently:

| App         | URL                    |
|-------------|------------------------|
| API Server  | http://localhost:3000  |
| Super Admin | http://localhost:3001  |
| Admin       | http://localhost:3002  |
| User        | http://localhost:3003  |

### Typical flow

1. Log in as **Super Admin** at `localhost:3001` → create an organisation (e.g. code: `acme`, name: `Acme Corp`)
2. Go to **Admin** at `localhost:3002` → sign up with org code `acme` → create and manage feature flags
3. Go to **User** at `localhost:3003` → sign up with org code `acme` → enter a feature key to check if it's enabled

## Design Decisions

- **Monorepo with Turborepo** — shared packages (`api`, `db`, `rpc`, `ui`, `env`) are consumed by all apps with zero duplication. Type-safe API calls between frontend and backend via Hono RPC eliminate the need for a separate API spec.
- **Turso (libSQL)** — SQLite-compatible distributed database. Simple to set up and works seamlessly with Drizzle's SQLite driver.
- **HTTP-only cookies over localStorage** — Prevents XSS from accessing auth tokens. Separate cookie names per role avoid cross-role session bleed.
- **Organisation code as a scoping mechanism** — Users and admins self-select their organisation at registration time by entering a code. This avoids building an invitation flow while still keeping data properly scoped per tenant.
- **Feature flag uniqueness** — `feature_key` has a unique index globally. A future improvement would be to scope uniqueness per organisation.
