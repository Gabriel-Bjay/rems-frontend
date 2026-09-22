# REMS — Rental & Estate Management System (Frontend)

Angular client for the [REMS API](https://github.com/Gabriel-Bjay/rems-backend), a rental and property management platform covering listings, tenancies, billing, and payments.

**Live demo:** https://rems-frontend-mu.vercel.app

## Features

- **Property & unit management** — browse and manage properties and their units
- **Owners, agents & tenants** — dedicated management views for each party in the system
- **Tenancy tracking** — tenancy lifecycle tied to units and tenants
- **Authenticated access** — token-based login with route guards and an HTTP interceptor that attaches auth headers to every request
- **Data grids** — DevExtreme-powered tables for browsing and editing records

## Tech stack

- **Framework:** Angular 22 (standalone components)
- **UI components:** DevExtreme
- **Backend:** [rems-backend](https://github.com/Gabriel-Bjay/rems-backend) (Laravel + PostgreSQL REST API)

## Getting started

```bash
git clone https://github.com/Gabriel-Bjay/rems-frontend.git
cd rems-frontend
npm install
ng serve
```

The app expects the API at the URL configured in `src/environments/environment.development.ts` (defaults to `http://127.0.0.1:8000/api` — see [rems-backend](https://github.com/Gabriel-Bjay/rems-backend) for running the API locally).

## Related

- [rems-backend](https://github.com/Gabriel-Bjay/rems-backend) — Laravel API this app talks to

## License

MIT
