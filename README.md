# IncidentOps

> Enterprise Incident Management Platform — inspired by PagerDuty, Opsgenie, Better Stack, Datadog, and Linear.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red.svg)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| State | TanStack Query v5, Zustand |
| Forms | React Hook Form, Zod |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | NestJS 10, MongoDB, Mongoose, JWT |
| Real-time | Socket.IO |
| Queue | BullMQ + Redis |
| Infra | Docker, Turborepo, pnpm |

## Project Structure

```
incidentops/
├── apps/
│   ├── web/          # Next.js 15 frontend → Vercel
│   └── api/          # NestJS backend → Railway
├── packages/
│   └── shared/       # Shared TypeScript types & enums
├── docker/           # Docker init scripts
├── docker-compose.yml
└── turbo.json
```

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker Desktop

### 1. Clone and install

```bash
git clone https://github.com/your-org/incidentops.git
cd incidentops
pnpm install
```

### 2. Environment setup

```bash
# Frontend
cp apps/web/.env.example apps/web/.env.local

# Backend
cp apps/api/.env.example apps/api/.env
```

Fill in your values in both `.env` files.

### 3. Start local infrastructure

```bash
docker-compose up -d mongodb redis
```

### 4. Run development servers

```bash
pnpm dev
```

This starts both `apps/web` (port 3000) and `apps/api` (port 4000) via Turborepo.

### 5. Access the app

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| API Docs (Swagger) | http://localhost:4000/api/docs |

## Available Scripts

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all apps for production
pnpm lint         # Run ESLint across all packages
pnpm format       # Format all files with Prettier
pnpm type-check   # TypeScript type checking
pnpm test         # Run all tests
```

## Deployment

| Target | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Railway |
| Database | MongoDB Atlas |
| Redis | Redis Cloud |

## Environment Variables

See `apps/web/.env.example` and `apps/api/.env.example` for all required environment variables.

## License

MIT
