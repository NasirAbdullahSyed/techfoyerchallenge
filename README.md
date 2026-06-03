# Country & State Management App

A full-stack CRUD application for managing Countries and States, built as a take-home assignment for Techfoyer.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **UI** | ShadCN UI (base-nova / Base UI), TailwindCSS v4, Framer Motion |
| **Backend** | Express.js, TypeScript |
| **ORM** | Drizzle ORM |
| **Database** | PostgreSQL (Supabase) |
| **Validation** | Zod (shared schemas between frontend & backend) |
| **HTTP Client** | Axios (via typed service classes) |
| **Monorepo** | pnpm workspaces + Turborepo |

## Project Structure

```
techfoyerchallenge/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express.js backend
└── packages/
    └── shared/       # Shared Zod schemas + TypeScript types
```

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **PostgreSQL** database (Supabase free tier recommended)

## Setup

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd techfoyerchallenge
pnpm install
```

### 2. Configure the backend

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=4000
FRONTEND_URL=http://localhost:3000
```

> **Supabase**: Create a free project at [supabase.com](https://supabase.com), then copy the **Connection string** (URI format) from `Project Settings → Database`.

### 3. Configure the frontend

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 4. Run database migrations

```bash
pnpm --filter api db:push
```

### 5. Seed the database (optional)

Seeds 3 countries (USA, Canada, Australia) with all their states/provinces/territories:

```bash
pnpm --filter api db:seed
```

### 6. Start the development servers

```bash
# Start both frontend and backend simultaneously
pnpm dev
```

Or start individually:

```bash
pnpm --filter api dev    # API at http://localhost:4000
pnpm --filter web dev    # Web at http://localhost:3000
```

---

## API Reference

Base URL: `http://localhost:4000/api`

### Countries

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/countries/search` | Search with pagination, filtering, sorting |
| `GET` | `/countries/list` | All active countries (for dropdowns) |
| `GET` | `/countries/:id` | Get single country |
| `POST` | `/countries` | Create country |
| `PUT` | `/countries/:id` | Update country |
| `DELETE` | `/countries/:id` | Delete country |
| `POST` | `/countries/bulk-delete` | Delete multiple countries |

### States

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/states/search` | Search with pagination, filtering, sorting |
| `GET` | `/states/:id` | Get single state |
| `POST` | `/states` | Create state |
| `PUT` | `/states/:id` | Update state |
| `DELETE` | `/states/:id` | Delete state |
| `POST` | `/states/bulk-delete` | Delete multiple states |

### Search Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `query` | string | `""` | Search by name or code |
| `isActive` | `all\|active\|inactive` | `all` | Filter by status |
| `page` | number | `1` | Page number |
| `pageSize` | number | `10` | Results per page (max 100) |
| `sortBy` | string | `name` | Column to sort by |
| `sortOrder` | `asc\|desc` | `asc` | Sort direction |

### Response Format

```json
{
  "success": true,
  "message": "Countries retrieved",
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "totalCount": 71,
    "totalPages": 8
  }
}
```

---

## Features

- **Full CRUD** for Countries and States
- **Search** — debounced 500ms, searches name & code
- **Filter** — by active/inactive status
- **Pagination** — server-side, configurable page size (10/20/30/50)
- **Sorting** — by any column, server-side
- **Bulk delete** — select multiple rows, delete at once
- **Dark / Light mode** — system default, toggle in header
- **Responsive** — mobile-friendly with sheet sidebar on small screens
- **Page transitions** — smooth Framer Motion animations
- **Loading states** — skeleton loaders, submit spinners
- **Error handling** — toast notifications + inline form errors
- **Shared validation** — single Zod schema used by both frontend (RHF) and backend

---

## Database Schema

```sql
-- Countries
CREATE TABLE countries (
  id        INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  code      VARCHAR(10)  NOT NULL UNIQUE,
  name      VARCHAR(100) NOT NULL,
  is_active BOOLEAN      NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- States / Provinces
CREATE TABLE states (
  id         INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  code       VARCHAR(10)  NOT NULL UNIQUE,
  name       VARCHAR(100) NOT NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT true,
  country_id INTEGER      NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_states_country_id ON states(country_id);
```

---

## Useful Commands

```bash
# Type-check all packages
pnpm typecheck

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Drizzle Studio (visual DB browser)
pnpm --filter api db:studio

# Generate new migrations after schema changes
pnpm --filter api db:generate
```
