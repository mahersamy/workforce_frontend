# Workforce Management Frontend

The frontend for the **Workforce Management Portal** — a role-based admin dashboard for managing employees, departments, and task assignments. Built with [Angular](https://angular.dev) 21 (standalone components, SSR-enabled) and [PrimeNG](https://primeng.org) 21 (Aura theme).

> Pairs with a separate backend API (ASP.NET-style REST API, JWT auth). See the backend repo's `README-Backend.md` for setup.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone components, no NgModules) |
| UI Library | PrimeNG 21 (Aura preset theme) + PrimeIcons |
| State | Angular Signals (no NgRx / external store) |
| HTTP | `HttpClient` with functional interceptors |
| Charts | Chart.js via `primeng/chart` |
| Styling | SCSS, CSS custom properties (design tokens), glassmorphism cards |
| Testing | Vitest |
| Forms | Reactive Forms |

---

## Architecture

The app follows a **feature-based, layered architecture** with a strict one-way data flow per feature: `Component → Facade → API / State`.

```
src/app/
├── core/                        # App-wide singletons, cross-cutting concerns
│   ├── constants/                # Backend routes, localStorage keys, regex patterns
│   ├── guards/                   # Route guards (auth, role-based)
│   ├── interceptors/             # JWT attach, global error handling
│   ├── layout/shell/              # App shell: sidebar nav, header, router-outlet
│   └── services/                 # Generic infra services (e.g. SSR-safe storage)
│
├── features/                    # One folder per business domain
│   ├── auth/                     # Login / register
│   ├── dashboard/                 # KPI overview + charts
│   ├── employees/                 # Employee directory CRUD
│   ├── departments/               # Department CRUD
│   └── tasks/                     # Task assignment & status workflow
│       └── <feature>/
│           ├── components/        # Smart (list) + presentational (dialog) components
│           ├── models/            # Domain models + request DTOs
│           └── services/
│               ├── <feature>-api.service.ts      # Pure HTTP calls
│               ├── <feature>-state.service.ts    # Signal-based state store
│               └── <feature>-facade.service.ts   # Orchestrates API + state for components
│
└── shared/                      # Reusable, domain-agnostic building blocks
    ├── components/                # data-table, paginator, filter-panel, field-error
    ├── directives/                 # has-role (structural), loading (button spinner)
    ├── validation/                 # Custom reactive-form validators
    └── models/                     # Generic shapes (e.g. PagedResult<T>)
```

### The API → State → Facade pattern

Every feature splits its data layer into three single-responsibility services:

1. **`*-api.service.ts`** — Thin wrapper around `HttpClient`. No state, no side effects. Just typed requests to `BACKEND_ROUTES`.
2. **`*-state.service.ts`** — Holds the feature's state as **writable signals** (list, pagination, filters, loading flags, selected/detail record) and exposes them as **readonly signals** to the outside world.
3. **`*-facade.service.ts`** — The only thing components talk to. Owns subscriptions (`takeUntilDestroyed`), coordinates API calls with state updates, fires `MessageService` toasts on success/error, and exposes simple imperative methods (`loadEmployees()`, `saveDepartment()`, `deleteTask()`...) plus the readonly signals components bind to in templates.

This keeps components "dumb": they read signals and call facade methods — no `.subscribe()`, no manual loading-flag juggling, no toast logic duplicated across the app.

```
Component  --calls-->  Facade  --calls-->  ApiService --> HTTP
   ^                      |
   |                      v
   '------ reads ------ StateService (signals)
```

### Auth & route protection

- **`AuthStateService`** holds the JWT, decoded user profile, and auth flag as signals; persists the session to `localStorage` via the SSR-safe `StorageService` (no-ops on the server, so the app is hydration-safe).
- **`AuthFacadeService`** wraps login/register/logout, redirecting on success and surfacing backend error messages.
- **`jwtInterceptor`** attaches the bearer token to every outgoing request.
- **`errorInterceptor`** centralizes HTTP error handling: maps status codes (400/401/403/404/409/422/500) to user-friendly toast messages, and force-logs-out the user on `401`.
- **`authGuard` / `publicGuard`** gate protected routes vs. the login/register pages based on `isAuthenticated()`.
- **`roleGuard`** restricts routes by `expectedRoles` route data (used on `/employees` and `/departments` — Admin/Manager only) and shows a warning toast + redirect on denial.
- **`HasRoleDirective`** (`*appHasRole="['Admin','Manager']"`) hides/shows template fragments reactively based on the signed-in user's role — used to conditionally render sidebar links and "Add" buttons.

### Routing

Routes are fully lazy-loaded (`loadComponent`) and nested under a single authenticated **shell** route:

```
/auth/login, /auth/register        → public, redirect away if already logged in
/ (ShellComponent, authGuard)
  ├── /dashboard                   → all authenticated roles
  ├── /employees   (roleGuard)     → Admin, Manager
  ├── /departments (roleGuard)     → Admin, Manager
  └── /tasks                       → all authenticated roles
** → redirect to /dashboard
```

SSR currently renders everything in **Client** render mode (`app.routes.server.ts`), since the app is auth-gated and not a good candidate for prerendering.

---

## Key Features

### 🔐 Authentication & Authorization
- JWT-based login/registration with reactive-form validation (custom password strength validator).
- Three roles surfaced from the token: `Admin`, `Manager`, `Employee`.
- Session persisted across reloads; auto-logout on token expiry (401).

### 📊 Dashboard
- KPI cards (total employees, total departments, total tasks).
- Doughnut chart (Chart.js) showing task distribution by status.
- Progress bars showing percentage breakdown: Completed / In Progress / Pending / Cancelled.

### 👥 Employee Management (Admin/Manager)
- Paginated, searchable employee directory.
- Create/edit dialog with department dropdown, hire date picker, salary, active-status toggle.
- Read-only profile detail dialog (avatar initials, department badge, formatted salary/hire date).
- Client-side filtering by name/email and department on top of server-side pagination.

### 🏢 Department Management (Admin/Manager)
- CRUD for departments with name + description.
- Same searchable, paginated list pattern as employees.

### ✅ Task Assignments
- Tasks visible to everyone; creation restricted to Admin/Manager.
- Employees can update the status of tasks assigned to them (`canUpdateStatus()` permission check).
- Priority (Low/Medium/High/Critical) and Status (Pending/In Progress/Completed/Cancelled) enums, with filtering by both plus assignee.
- Assignee picker scoped to active employees, with rich item templates showing name + department.

### 🧩 Reusable Shared Components
- **`DataTable`** — a generic, config-driven table (`DataTableConfig`, provided per-feature) supporting typed cell renderers (ID, Text, Date, Currency, User-avatar, inline Select-edit), row actions, bulk actions, skeleton loading state, and a polished empty/error state with retry.
- **`AppPaginator`** — custom pagination control with page-size selector and ellipsis-aware page number generation.
- **`FilterPanel`** — declarative filter bar: pass a `FilterField[]` config (text/select/date) and get a reactive form that emits `filtersChanged` on every value change.
- **`FieldErrorComponent`** — drop-in validation message renderer driven by a control's `ValidationErrors`, with overridable per-field messages.
- **`LoadingDirective`** (`[appLoading]`) — disables a button and appends a spinner icon while an async operation is in flight.

### 🎨 UI/UX
- Dark, glassmorphism-styled design system driven entirely by CSS custom properties (`src/styles/abstracts/_variables.scss`, `_theme.scss`) — colors, shadows, blur, and transitions are tokens, not hardcoded.
- Responsive shell: collapsible sidebar with overlay on mobile (`<992px`), sticky header.
- PrimeNG components re-skinned via `::ng-deep` token overrides to match the custom theme (tables, dialogs, paginators, selects).
- Global toast notifications (`p-toast` + `MessageService`) for every CRUD success/error and auth event.
- Confirmation dialogs (`p-confirmDialog`) for destructive actions like department deletion.

---

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

---

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
