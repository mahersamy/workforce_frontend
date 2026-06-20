# WorkforceManagementFrontend

The frontend for the Workforce Management Portal, built with [Angular](https://angular.dev) 21 (standalone components, SSR-enabled) and [PrimeNG](https://primeng.org) for UI components.

Key tech: Angular 21, PrimeNG 21 (Aura theme), Chart.js, RxJS, Angular SSR/Express server, Vitest for unit tests.

## Prerequisites

- [Node.js](https://nodejs.org/) — version compatible with Angular 21 (Node 20.19+ / 22.12+)
- npm 9+
- The backend API running (see the backend `README-Backend.md`) — by default expected at `http://localhost:5012`

## 1. Install dependencies

```bash
npm install
```

## 2. Configure the API URL

Environment files live in `src/environments/`:

- `environment.ts` — development (`apiUrl: 'http://localhost:5012'`)
- `environment.prod.ts` — production
- `environment.stage.ts` — staging

Update `apiUrl` to point at wherever your backend is running.

## 3. Run the dev server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The app reloads automatically on file changes.

Default seeded login (from the backend seed data): **username:** `admin` · **password:** `Admin123!`

## 4. Build

```bash
ng build
```

Build artifacts are written to `dist/`. The production build is optimized by default.

For SSR, build then run the Node/Express server:

```bash
ng build
node dist/workforce_management_frontend/server/server.mjs
```

## 5. Run tests

```bash
npm test
# or
ng test
```

Uses [Vitest](https://vitest.dev/) as the test runner.

## Project structure (high level)

```
src/app/
  core/                 # guards, interceptors, layout shell, constants, services
  features/
    auth/                # login / register
    dashboard/           # overview + charts
    employees/           # employee CRUD
    departments/         # department CRUD
    tasks/               # task assignment & status
  shared/
    components/          # data-table, paginator, filter-panel, field-error...
    directives/           # has-role, loading
    validation/
```

## Roles

The app supports three roles surfaced from the backend JWT: `Admin`, `Manager`, `Employee`.
- Employees & Departments management requires `Admin` or `Manager`.
- Tasks are visible to everyone; only managers/admins can create tasks, while an employee can update the status of tasks assigned to them.

## Troubleshooting

- **Network errors / CORS issues**: confirm the backend's `apiUrl` is reachable and CORS is configured server-side to allow `http://localhost:4200`.
- **401 errors immediately after login**: check that the JWT secret/issuer/audience match between what the backend issues and validates.
- **Blank page after `ng build` + SSR**: make sure you're serving via `server.mjs`, not just opening `dist/.../browser/index.html` directly (the app relies on the Express server for SSR routes).
