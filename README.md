# Todo API

A REST API for user auth and personal todo management, built with **Express 5**, **TypeScript**, **Prisma 7** and **PostgreSQL**. JWT-based authentication, Swagger docs, pagination and filtering on the todo list.

## Live

| | URL |
| --- | --- |
| API base | https://todo-backend-app-bfff.onrender.com/api |
| Swagger UI | https://todo-backend-app-bfff.onrender.com/api/docs |
| Health check | https://todo-backend-app-bfff.onrender.com/ |

Hosted on [Render](https://render.com) (web service + managed PostgreSQL). The free instance sleeps after inactivity, so the first request can take ~30s to wake.

## Tech stack

- **Runtime:** Node.js, Express 5, TypeScript (ESM, `NodeNext`)
- **Database:** PostgreSQL via Prisma ORM 7 with the `@prisma/adapter-pg` driver adapter
- **Auth:** `jsonwebtoken` (Bearer tokens), `bcrypt` for password hashing
- **Docs:** `swagger-jsdoc` + `swagger-ui-express`

## Project layout

```
src/
  app.ts                 # Express app + server bootstrap
  config/
    prisma.ts            # PrismaClient wired to the pg adapter
    db.ts                # raw pg Pool (fallback / direct SQL)
    swagger.ts           # OpenAPI spec assembled from JSDoc comments
  routes/                # /auth and /todos routers
  controllers/           # request handlers
  services/              # business logic + DB access
  middleware/
    auth.ts              # JWT verification
    error.middleware.ts  # central error handler
  generated/prisma/      # generated Prisma client (git-ignored)
prisma/
  schema.prisma          # data model
prisma7.config.ts        # Prisma 7 config (schema path + datasource URL)
```

## Local setup

### Prerequisites

- Node.js 20+
- A local PostgreSQL instance (Homebrew, Docker, Postgres.app, ...)

### 1. Install

```bash
npm install
```

`postinstall` runs `prisma generate && tsc`, so the Prisma client and `dist/` are built automatically.

### 2. Environment

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL=postgresql://USER@localhost:5432/tododb
JWT_SECRET=replace-with-a-long-random-string
# Optional: used only by Swagger UI's "Try it out" base URL.
# Leave unset locally to default to http://localhost:3000/api
# PUBLIC_URL=https://your-app.onrender.com
```

Create the database if it doesn't exist:

```bash
createdb tododb
```

### 3. Apply the schema

```bash
npm run db:deploy      # prisma db push — creates the users and todos tables
```

### 4. Run

```bash
npm run dev            # tsx watch, hot reload on src/**
```

API on `http://localhost:3000`, docs on `http://localhost:3000/api/docs`.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start in watch mode with `tsx` |
| `npm run build` | `prisma generate` + `tsc` → `dist/` |
| `npm start` | Run the compiled server (`node dist/app.js`) |
| `npm run typecheck` | Type-check without emitting |
| `npm run db:deploy` | Push `schema.prisma` to the database (`prisma db push`) |

## API

Base path: `/api`. All `/todos` routes require an `Authorization: Bearer <token>` header.

### Auth

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | `first_name`, `email`, `password`, `last_name?` | Returns the user and a JWT. `409` if the email exists. |
| `POST` | `/api/auth/login` | `email`, `password` | Returns the user and a JWT. `401` on bad credentials. |

### Todos (authenticated)

| Method | Path | Body / Query | Notes |
| --- | --- | --- | --- |
| `POST` | `/api/todos` | `title`, `is_important?` | Create a task. |
| `GET` | `/api/todos` | `?filter=all\|completed\|important`, `?page=1`, `?limit=10` | Paginated list, scoped to the current user. |
| `PATCH` | `/api/todos/:id` | `title?`, `is_important?`, `is_completed?` | Update a task. |
| `PATCH` | `/api/todos/:id/complete` | `is_completed?` (default `true`) | Toggle completion. |
| `DELETE` | `/api/todos/:id` | — | `204` on success. |

### Example

```bash
# Register
curl -X POST https://todo-backend-app-bfff.onrender.com/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"first_name":"Ada","last_name":"Lovelace","email":"ada@example.com","password":"secret123"}'

# Use the returned token
TOKEN=eyJhbGc...

# Create a todo
curl -X POST https://todo-backend-app-bfff.onrender.com/api/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Buy milk","is_important":true}'

# List important todos
curl "https://todo-backend-app-bfff.onrender.com/api/todos?filter=important&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

## Data model

```prisma
model users {
  id         Int       @id @default(autoincrement())
  first_name String    @db.VarChar(100)
  last_name  String?   @db.VarChar(100)
  email      String    @unique @db.VarChar(100)
  password   String    @db.VarChar(255)
  created_at DateTime? @default(now()) @db.Timestamp(6)
  todos      todos[]
}

model todos {
  id           Int       @id @default(autoincrement())
  user_id      Int
  title        String    @db.VarChar(255)
  is_important Boolean?  @default(false)
  is_completed Boolean?  @default(false)
  created_at   DateTime? @default(now()) @db.Timestamp(6)
  users        users     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

## Deployment (Render)

The app deploys straight from the `todo_app_test` branch of
[`Asharulislam/Todo-backend-app`](https://github.com/Asharulislam/Todo-backend-app).

**Web service**

| Setting | Value |
| --- | --- |
| Build command | `npm install` (the `postinstall` hook runs `prisma generate && tsc`) |
| Start command | `node dist/app.js` |
| Environment | `DATABASE_URL` (Render **Internal** database URL), `JWT_SECRET`, `PUBLIC_URL` (the public service URL) |

`PORT` is injected by Render — do not set it; the app reads `process.env.PORT`.

**Database**

Managed PostgreSQL on Render. Two connection strings for the same database:

- **Internal URL** — reachable only from services inside Render. Used by the web service. Faster, no SSL config needed.
- **External URL** — reachable from anywhere over the public internet (append `?sslmode=require`). Used for running migrations from a laptop or connecting a GUI client (pgAdmin, TablePlus, DBeaver).

The schema is not applied automatically on deploy. After changing `schema.prisma`, run once against the database:

```bash
DATABASE_URL="<external-url>?sslmode=require" npx prisma db push
```

The local and deployed databases are entirely separate — they share only the schema.
