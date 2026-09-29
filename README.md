# REMS — Rental & Estate Management System (Frontend)

Angular client for the [REMS API](https://github.com/Gabriel-Bjay/rems-backend), a rental and property management platform covering listings, tenancies, billing, and payments.

**Live demo:** https://rems-frontend-mu.vercel.app

## Features

- **Dashboards by role** — staff and owners see occupancy, rent collected against billed, a six-month trend, arrears, leases ending soon and recent activity; tenants see their balance, home, deposit and requests
- **Invoices** — filter by status, see each invoice's charges and the payments applied to it, issue the period's invoices, and void mistakes
- **Payments** — tenants report M-Pesa, bank, card or cash payments; staff record payments and confirm them, which applies the money to the oldest unpaid invoices
- **Maintenance board** — requests move from open to in progress to resolved; agents pick tickets up, admins assign them, and repair costs are recorded
- **Tenancy lifecycle** — draft leases, then activate them (opening the deposit and first invoice) or end them
- **Notifications** — a bell with unread counts that links straight to the invoice, payment or request concerned
- **Property & unit management** — properties, units, owners, agents and tenants in DevExtreme data grids
- **Authenticated access** — token-based login, a route guard, and an interceptor that signs requests and sends expired sessions back to the login page

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

The app expects the API at the URL configured in `src/environments/environment.development.ts` (defaults to `http://127.0.0.1:8000/api` — see [rems-backend](https://github.com/Gabriel-Bjay/rems-backend) for running the API locally). Load the backend's demo data to sign in as an owner, agent or tenant and see each role's view.

## Related

- [rems-backend](https://github.com/Gabriel-Bjay/rems-backend) — Laravel API this app talks to

## License

MIT
