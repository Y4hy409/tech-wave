# Fixora Server (Express + PostgreSQL)

Lightweight backend skeleton for Fixora.

Quick start

1. Create a Postgres database and set `DATABASE_URL` (see `.env.example`).
2. From `server/` install dependencies and run:

```bash
cd server
npm install
cp .env.example .env
# update DATABASE_URL in .env
npm run dev
```

Endpoints

- `POST /complaints` — create complaint (body: `user_id`, `category`, `priority`, `description`)
- `GET /complaints` — list complaints
- `PUT /complaints/:id` — update (body may include `status`, `assigned_staff`, `priority`)
- `POST /complaints/escalate/:id` — escalate complaint
- `GET /analytics` — basic analytics

DB schema

See `migrations/schema.sql` to create the tables.
