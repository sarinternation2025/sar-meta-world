# SAR-META-WORLD Monorepo

Futuristic AI-powered admin dashboard with real-time chat, 3D globe, advanced controls, and robust backup/monitoring. Built with React (Vite, Tailwind), Node.js backend, CLI agent, and Docker Compose.

## Structure

- `react-app/` — Frontend (Vite + React + Tailwind)
- `backend/` — Node.js/Express API, backup, monitoring
- `docker-compose/` — Service configs (Postgres, Redis, Mosquitto, etc)
- `scripts/` — Utility scripts

## Getting Started

```sh
# Install all dependencies
npm install

# Start both frontend and backend
npm run dev

# Or run individually
npm run start:frontend
npm run start:backend
```

## Useful Scripts
- `npm run lint` — Lint all packages
- `npm run format` — Format all packages
- `npm run install:all` — Install all workspace deps

## Docker Compose
See `docker-compose/` for service orchestration.

## Environment
Copy `.env.example` to `.env` in each package and fill in secrets.

---

For more, see individual package READMEs.
