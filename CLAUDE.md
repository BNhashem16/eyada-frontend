# Working With This Repo (Assistant Rules)

- **Reply in English only.** The user may write in Arabic or English; assistant output (narration, summaries, plans, error explanations) is always English. Code, identifiers, and quoted user strings stay as-is.
- **Route work through SuperClaude:**
  - "improve" / "refactor" / "clean up" / "optimize" → invoke the `sc:improve` skill before editing.
  - "implement" / "build" / "add feature" → invoke the `sc:implement` skill before editing.
  - Pass the user's request verbatim as `args`. Pure questions, debugging, or one-line fixes do **not** need SuperClaude.
- **Responsive by default (mandatory).** Every new component, page, or modification must be fully responsive across all screen sizes. No exceptions, no "we'll polish it later".
  - **Required breakpoints:** mobile 320px, 375px, 414px → tablet 768px, 1024px → desktop 1280px, 1440px, 1920px+. Test the layout at each.
  - **Mobile-first:** write base styles for mobile, then layer Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) upward — never desktop-first with mobile overrides.
  - **No fixed pixel widths/heights** that break small viewports. Use `min-w-0`, `max-w-*`, `w-full`, fluid units (`%`, `rem`, `clamp(...)`), and CSS grid/flex with `flex-wrap` / `min-w-0` on children to prevent overflow.
  - **No horizontal scroll on mobile.** Long tables → wrap in an overflow-x scroll container with a sticky first column or switch to a card list at `< md`. Long forms → stack at mobile, grid at `md+`.
  - **RTL + LTR both.** Use logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`) instead of `ml-*`/`mr-*`/`left-*`/`right-*`. Verify the layout in both Arabic (RTL) and English (LTR).
  - **Touch targets ≥ 44×44px** on mobile. Buttons, icon-buttons, and links inside lists must meet this even when visually small.
  - **Typography scales.** Use the project's fluid type tokens or `text-sm md:text-base lg:text-lg`-style ramps; never ship fixed `text-2xl` headlines that overflow on 320px.
  - **Images & media:** always set `width`/`height` (or `fill` + a sized parent), use `next/image`, and pick `sizes` that matches the responsive layout. No CLS.
  - **Navigation:** sidebar collapses to a sheet/drawer at `< lg`; header turns into a hamburger; multi-tab UIs become a `Select` or horizontal scroll on mobile.
  - **Tables / data grids:** below `md`, switch to a card layout or expose only the priority columns. Never let a 6-column table force horizontal scroll on a phone.
  - **Modals/dialogs:** full-screen sheet on mobile, centered dialog on `md+`. Constrain max-height with `max-h-[90dvh]` and make the body scrollable.
  - **Verification before declaring done:** mentally (or via DevTools) check the change at 320px, 768px, and 1280px in both `ar` and `en`. If a real browser is available, test it.
- **Translations are mandatory for every task (no exceptions).** Any new or modified string that is rendered to a user, returned to a client, or shown in a log surfaced to a user MUST be translated in BOTH locales — whether the change is in the frontend or in the backend (`C:\Nest\eyada_backend`). A task is not complete until translations are added.
  - **Frontend (`C:\React\eyada-frontend`):**
    - Every user-visible string goes through `t()` (client components via `useTranslation`) or `getTranslation(key, locale?)` (server components, Zod factories, page `metadata`, route handlers, axios layer, utilities, `next/font` metadata, OG/Twitter/apple icon image generators, `WebsiteJsonLd` and other JSON-LD blocks, `loading.tsx`/`error.tsx`/`not-found.tsx`, toast/error fallbacks, `aria-label`, `placeholder`, `title`, button labels, table headers).
    - **Both files updated.** Adding a key means adding it to BOTH `lib/i18n/ar.json` AND `lib/i18n/en.json`. ar is the source of truth and the fallback; en must be a real translation, not a copy of the Arabic value.
    - **Zod schemas are factories** taking a `locale` and resolving messages via `getTranslation(...)`. Never inline error strings.
    - **Page `metadata` MUST use `getTranslation(...)`** — never a literal title/description.
    - **Doctor prefix** (`"د."` / `"Dr."`) ALWAYS comes from `doctors.doctorPrefix`.
    - Use logical Tailwind direction utilities only (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`).
    - Localized backend fields (e.g. `{ ar, en }`) MUST be read via `lib/utils/multilingual.ts` (`getLocalizedText`), never `field.ar || field.en` inline.
  - **Backend (NestJS — `C:\Nest\eyada_backend`):**
    - Any new or changed user-facing message — validation errors, exception messages, email/SMS/push templates, scheduled notifications, success messages, audit-log strings rendered to users — MUST be added in BOTH Arabic and English in the backend's i18n source (`src/i18n/ar/*.json` + `src/i18n/en/*.json`, or wherever the project keeps locale catalogs).
    - Prefer returning a **localization key** (e.g. `errors.appointment.slot_taken`) over a raw message; the frontend resolves via `t()`. When the backend returns a literal message, it MUST honor the `Accept-Language` header.
    - DTO `class-validator` messages, `i18nValidationMessage(...)` calls, and any string passed to `HttpException`/`BadRequestException`/`UnauthorizedException` are user-visible and MUST be localized.
    - Notification templates (email subject/body, SMS text, push title/body, WhatsApp messages) MUST exist in both locales and be selected based on the recipient's stored locale preference.
    - Enum labels exposed to clients (status, role, payment method type) MUST be returned as `{ value, label: { ar, en } }` or as a localization key — never as a single hardcoded string.
  - **Pre-merge translation checklist (every PR):**
    - [ ] Every new/changed string has keys in BOTH `ar.json` AND `en.json` (frontend) AND in BOTH ar/en backend catalogs (backend).
    - [ ] No hardcoded Arabic OR English literals in JSX, props, Zod messages, toasts, page metadata, JSON-LD, OG images, or backend exception messages.
    - [ ] English values are real translations, not copy-pasted Arabic.
    - [ ] Cross-repo: if backend added a new error key, frontend has a matching `t()` lookup and a translated value in both files. If frontend started consuming a new field, backend returns it localized.
    - [ ] Run `/i18n-audit` (frontend) before declaring the task done.

---

# Full-Stack Synchronization Rules (Frontend ↔ Backend)

## Repository Context

- **Backend (NestJS)**: `C:\Nest\eyada_backend`
- **Frontend (Next.js 16 + React 19)**: `C:\React\eyada-frontend`

These two repositories are a single product boundary and must be treated as one integrated system.

---

# Mandatory Cross-Repository Change Synchronization

## Core Rule

Any change in one repository that affects contracts, behavior, or data must immediately trigger an impact review and corresponding updates in the other repository.

A change is not complete until both applications remain fully compatible.

---

# Backend → Frontend Synchronization

Whenever the NestJS backend changes any of the following:

- API request or response contracts
- DTOs or validation schemas
- Entity shapes exposed to clients
- Authentication or authorization flows
- Error response structures
- WebSocket events or payloads
- Business rules consumed by the UI
- Pagination, filtering, or sorting behavior
- Feature flags or configuration values
- Upload/download contracts
- Localization response behavior

You MUST immediately:

1. Identify all affected frontend surfaces.
2. Update shared TypeScript types and interfaces.
3. Update API endpoint definitions.
4. Update API client methods.
5. Update TanStack Query hooks.
6. Update forms, Zod schemas, and validation logic.
7. Update all impacted UI components.
8. Update error handling and loading states.
9. Update real-time subscriptions (WebSocket/SSE) if applicable.
10. Update unit, integration, and E2E tests.
11. Verify end-to-end compatibility.

---

# Frontend → Backend Synchronization

Whenever the Next.js frontend changes any of the following:

- API consumption patterns
- Required fields or payload shapes
- Validation expectations
- New filters, sorting, or pagination requirements
- New UI workflows
- New real-time interaction requirements
- File upload expectations
- Authentication flows
- Role-based access expectations
- Localization requirements
- Performance expectations that affect API design

You MUST immediately:

1. Review backend compatibility.
2. Update DTOs, validation pipes, and schemas as needed.
3. Update controllers, services, and serializers.
4. Update API documentation and endpoint contracts.
5. Update authorization rules and guards if required.
6. Update WebSocket gateways or event emitters if needed.
7. Add or modify database queries and indexes when necessary.
8. Update backend tests (unit, integration, E2E).
9. Validate backward compatibility.
10. Verify end-to-end functionality.

---

# Real-Time Communication Standards

For features requiring immediate UI updates:

- Prefer **WebSockets** for bidirectional communication.
- Use **Server-Sent Events (SSE)** for server-to-client streaming only.
- Use polling only when real-time transport is not appropriate.

## Real-Time Implementation Requirements

- Define event contracts before implementation.
- Strongly type all event payloads.
- Version breaking event contracts when necessary.
- Implement reconnection and retry strategies.
- Ensure idempotent client event handling.
- Handle out-of-order event delivery safely.
- Support optimistic UI updates where appropriate.

---

# Contract-First Development

Before implementing any cross-boundary feature:

1. Define request and response contracts.
2. Define validation rules.
3. Define error contracts.
4. Define event payloads (if real-time).
5. Define authorization requirements.
6. Define versioning or migration strategy if breaking.

Prefer shared schema generation where possible:

- OpenAPI-generated TypeScript clients
- Shared DTO packages
- Contract validation tests

---

# Change Impact Checklist

Before completing any task, always verify:

- [ ] Backend contracts still match frontend expectations
- [ ] Frontend types still match backend responses
- [ ] Validation rules are synchronized
- [ ] Error handling remains compatible
- [ ] Authentication flows remain compatible
- [ ] Role permissions remain compatible
- [ ] Real-time events remain compatible
- [ ] Tests pass on both repositories
- [ ] No breaking changes are left undocumented

---

# Engineering Review Protocol

Before making any code changes, perform a structured review.

## Review Modes (Ask First)

### Option 1 — BIG CHANGE

Review interactively by section:

1. Architecture
2. Code Quality
3. Testing
4. Performance

- Maximum 4 issues per section
- Stop after each section for approval

### Option 2 — SMALL CHANGE

Review interactively with:

- One high-impact question per section

Do not proceed until a mode is selected.

---

# Review Standards

For every issue identified:

## Required Output Format

### Issue N: <Title>

#### Option A (Recommended)

- Description
- Pros
- Cons
- Implementation effort
- Risk
- Maintenance burden

#### Option B

- Description
- Pros
- Cons
- Implementation effort
- Risk
- Maintenance burden

#### Option C (Optional / Do Nothing)

- Description
- Pros
- Cons
- Implementation effort
- Risk
- Maintenance burden

## Decision Prompt

AskUserQuestion:
Which option do you prefer for Issue N?

- A: Recommended approach
- B: Alternative approach
- C: Leave as-is

Do not proceed until the user responds.

---

# Engineering Preferences

- Aggressively enforce DRY.
- Comprehensive testing is mandatory.
- Prefer explicitness over cleverness.
- Handle edge cases thoroughly.
- Avoid both under-engineering and over-engineering.
- Optimize for maintainability, correctness, and clarity.

---

# Assistant Execution Rules

- Always analyze cross-repository impact before coding.
- Never treat frontend and backend as isolated systems.
- Never leave either repository in a partially compatible state.
- Explicitly document breaking changes.
- Recommend contract-first solutions whenever possible.
- Ask for approval before making architectural or behavioral changes.

A feature is only complete when:

- both repositories are updated,
- tests are aligned,
- contracts are synchronized,
- and end-to-end behavior is verified.

---

# Frontend Project Reference (Eyada — `C:\React\eyada-frontend`)

Next.js 16 + React 19 frontend for Eyada (clinics-eg.com), a multi-role healthcare/clinic platform serving patients, doctors, secretaries, pharmacy owners, drivers, and admins. Default locale is Arabic (RTL); English is supported as a secondary locale.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack dev)
- **UI**: React 19, Tailwind CSS v4, Radix UI primitives, lucide-react icons
- **State**: Zustand (auth, persisted to localStorage), TanStack Query v5 (server state)
- **Forms**: react-hook-form + Zod (`@hookform/resolvers`)
- **HTTP**: axios with interceptor-based token refresh
- **i18n**: Custom JSON-based translator. `getServerLocale()` resolves the active locale on the server side from the `x-locale` request header (set by `proxy.ts` from cookie / `Accept-Language`). The `[locale]` route-segment migration is at Phase 1 (scaffolding only, no routes moved yet).
- **Observability**: `@sentry/nextjs` (errors + performance + Replay, no-ops without DSN). Per-tab session correlation ID forwarded via `x-correlation-id`.
- **Edge layer**: `proxy.ts` (was `middleware.ts` — Next 16 renamed the convention). Sets per-request CSP nonce (sensitive routes) or static `'unsafe-inline'` CSP (public routes), `X-Robots-Tag: noindex` on sensitive prefixes, locale forwarding, correlation ID.
- **Fonts**: Cairo (Arabic, primary), Inter (English) via `next/font/google`

## Commands

```bash
npm run dev          # Turbopack dev (port from .env.local PORT, default 3000)
npm run build        # Production build
npm start            # Start built app
npm run lint         # ESLint (next/core-web-vitals)
npm run format       # Prettier write
npm run format:check # Prettier check
npm run analyze      # Production build with @next/bundle-analyzer (ANALYZE=true)
npm test             # Vitest unit tests (run once)
npm run test:watch   # Vitest watch mode
npm run test:coverage# Vitest coverage report
npm run test:ui      # Vitest UI
npm run test:e2e     # Playwright E2E
npm run test:e2e:ui  # Playwright UI runner
```

Vitest (unit + integration) and Playwright (E2E) are wired. The 80% coverage target from project rules applies to new code; existing code may be uncovered.

## Path Alias

`@/*` → repo root. Always import via `@/lib/...`, `@/features/...`, `@/components/...`, `@/types`, `@/hooks/...` rather than relative `../../`.

## Directory Layout

```
app/                  # App Router with role-based route groups
  (admin)/  (auth)/  (doctor)/  (driver)/
  (patient)/  (pharmacy-owner)/  (public)/  (secretary)/
  track/              # Public booking-number tracker
  layout.tsx          # Root layout: html lang="ar" dir="rtl", Providers, metadata via getTranslation
components/
  common/             # Shared layout shells (admin-layout, dashboard-layout, public-layout, header, sidebar, ...)
  providers/          # LanguageProvider > ThemeProvider > QueryProvider > ToastProvider
  ui/                 # Radix-based primitives
  home/  legal/  seo/  track/
features/             # Feature modules: each has components/, hooks/, optionally schemas/, index.ts
  admin/  ai/  auth/  clinics/  contact/  doctor-portal/  doctors/
  driver/  feedback/  locations/  patients/  pharmacy-owner/  secretary/  specialties/
hooks/                # Cross-feature hooks
lib/
  api/                # axios client, endpoints map, response unwrap helpers
  auth/               # Zustand auth store + route guards
  i18n/               # ar.json, en.json, useTranslation, getTranslation, config
  utils/              # cn, date, storage, multilingual, api-error, compress-image
types/                # Shared domain models, DTOs, enums
public/               # Static assets
scripts/dev.js        # Reads PORT from .env.local then runs `next dev --turbopack`
postman/  prompts/    # API collection + LLM prompt scratch
```

## i18n — Critical Conventions

- Translation files: `lib/i18n/ar.json` and `lib/i18n/en.json` (Arabic is the source of truth and the fallback).
- **Client components**: `const { t, locale, isRtl, dir } = useTranslation()`.
- **Server / static / non-React contexts** (Zod schemas, page metadata, utilities): `getTranslation(key, locale?)` — defaults to `ar`.
- Locale persists in `localStorage` under `eyada-locale` and is sent on every request as `Accept-Language`.
- Zod schemas are **factory functions** that take a locale and use `getTranslation(...)` for messages — never hardcode error strings.
- Page `metadata` exports use `getTranslation(...)` (server-side).
- Doctor name prefix uses the `doctors.doctorPrefix` key ("د." / "Dr."). Never hardcode "د.".
- When you add a key, add it to **both** `ar.json` and `en.json`.

## Auth & API

### Token storage and refresh

- `lib/api/client.ts` exports `apiClient` (axios), `tokenStorage`, and helpers `apiGet/apiPost/apiPatch/apiPut/apiDelete/apiUpload`.
- Tokens live in `localStorage` under `eyada_access_token` / `eyada_refresh_token`.
- Request interceptor injects `Authorization: Bearer <token>` and `Accept-Language: <locale>`.
- Response interceptor:
  - **401 → silent refresh** via `/auth/refresh`, queues concurrent requests, retries once. On refresh failure it clears tokens, fires `onSessionInvalidated`, and lets the auth store reset.
  - **403 `DOCTOR_PROFILE_INCOMPLETE`** → fires `onDoctorProfileIncomplete` which redirects to `/doctor/profile`.
- Helpers `apiGet/...` automatically unwrap `{ success, data }` envelopes.

### Auth store (`lib/auth/store.ts`)

- Zustand store, persisted (`name: "eyada-auth"`), `partialize` keeps only `user` + `isAuthenticated`.
- `extractTokens()` and `normalizeUser()` helpers handle both nested/flat token shapes and `full_name`/`fullName` plus role uppercase normalization.
- The store registers callbacks with `tokenStorage` for session invalidation, doctor-profile redirects, and React Query cache clearing — clearing the query cache on login/logout is intentional to prevent cross-user data leakage.
- Selector hooks: `useUser`, `useIsAuthenticated`, `useIsAuthLoading`, `useIsHydrated`, `useLogout`.

### Endpoints

All API paths live in `lib/api/endpoints.ts`, grouped by role/area: `AUTH_ENDPOINTS`, `PUBLIC_ENDPOINTS`, `PATIENT_ENDPOINTS`, `DOCTOR_ENDPOINTS`, `SECRETARY_ENDPOINTS`, `DOCTOR_SECRETARIES_ENDPOINTS`, `ADMIN_ENDPOINTS`, `PHARMACY_OWNER_ENDPOINTS`, `PATIENT_PHARMACY_ENDPOINTS`, `ADMIN_PHARMACY_ENDPOINTS`, `PATIENT_PRESCRIPTION_ENDPOINTS`, `PHARMACY_OWNER_PRESCRIPTION_ENDPOINTS`, `ADMIN_PRESCRIPTION_ENDPOINTS`, `DRIVER_ENDPOINTS`, `UPLOAD_ENDPOINTS`, `AI_ENDPOINTS`. Add new endpoints to the matching map; do not hand-write URL strings in features.

## Features Pattern

Each `features/<area>/` is self-contained:

```
features/<area>/
  components/    # UI specific to this feature
  hooks/         # TanStack Query hooks, mutations, feature-local state
  schemas/       # Zod factory schemas (locale-aware)
  index.ts       # Public surface re-exported for app/* to import
```

App route segments stay thin — they compose `features/*` + `components/common` shells.

## Providers & Theming

`components/providers/index.tsx` order: **Language → Theme → Query → Toast**. Don't reorder casually — language must be available before downstream providers that read `localStorage` and before any component that calls `useTranslation`.

`html lang/dir` is hardcoded `ar`/`rtl` in `app/layout.tsx`. Locale switching at runtime is handled client-side by `LanguageProvider` (which mutates `document.documentElement` lang/dir). True SSR locale switching would require introducing a `[locale]` segment.

## Coding Conventions (project-specific)

- **TypeScript strict** is on. Avoid `as any`. Prefer narrowing or extending the relevant type in `types/`.
- **Immutability**: never mutate Zustand state directly — use `set({ ... })` returning a new object.
- **No `console.log` in committed code.** `console.error` is acceptable inside dev-only error boundaries; most call sites should surface errors via `useToast`.
- **File size**: keep files under ~800 lines and functions focused (<50 lines where reasonable).
- **Forms**: react-hook-form + Zod factory schemas; pass the resolver from `@hookform/resolvers/zod`.
- **Server state**: TanStack Query. Use stable query keys (e.g. `['doctors', filters]`). Don't mirror server data into Zustand.
- **Animations**: prefer compositor-friendly properties (transform, opacity).
- **Bundle**: heavy / role-specific UIs should be dynamically imported when not on the critical path. `next.config.ts` already lists `optimizePackageImports` for radix and lucide.

## Environment

`.env.local` (git-ignored) and `.env.example` (committed):

```
NEXT_PUBLIC_API_URL=...
NEXT_PUBLIC_APP_NAME=عيادة
NEXT_PUBLIC_APP_URL=...
NEXT_PUBLIC_STORAGE_BASE_URL=...
PORT=3001          # optional, read by scripts/dev.js

# Sentry (optional locally, required for production error reports)
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_DSN=...
SENTRY_ORG=...
SENTRY_PROJECT=...
SENTRY_AUTH_TOKEN=...   # build-time only, set on Vercel for source-map upload
```

`API_BASE_URL` falls back to `http://localhost:3000` when `NEXT_PUBLIC_API_URL` is missing. Sentry SDK no-ops when the DSN is unset, so leaving these blank is safe in development and on preview deploys.

## Lint debt (follow-up)

`npm run lint` currently reports ~99 errors / ~191 warnings. Categorized:

- **30 × `react-hooks/set-state-in-effect`** — real bugs (potential cascading
  renders / loops). Highest fix priority.
- **50 × `@typescript-eslint/no-explicit-any`** — type laxity, mostly in
  feature hooks and admin pages.
- **16 × `react-hooks/exhaustive-deps`** — hidden-stale-closure risks.
- **156 × `@typescript-eslint/no-unused-vars`** (warnings) — cosmetic.
- **2 × `react-hooks/refs`** — refs read during render, real bugs.
- **1 × `react-hooks/rules-of-hooks`** — `lib/i18n/use-translation.ts:35`,
  the conditional `useLanguageHook()` inside the SSR-safety dance. Documented
  as intentional in the "Known Footguns" section; refactor with care.

CI runs `npm run lint`. Until baseline is cleaned up, treat status-check
failure on lint as expected and merge based on the *delta* — new contributions
must not introduce new errors. Consider adding `continue-on-error: true` on
the lint step in `.github/workflows/ci.yml` while the baseline is being
worked down (requires a workflow-scoped token to commit).

## Known Footguns

- Backend may return auth tokens nested (`{ tokens: {...}, user }`) or flat (`{ accessToken, refreshToken, user }`). The `AuthResponse` type covers both — read `response.tokens?.accessToken ?? response.accessToken`.
- `User.role` arrives in mixed case from the API; the store normalizes it to UPPERCASE on every entry point. Compare against the uppercase form.
- `User.fullName` is canonical; `User.name` is a legacy alias kept in sync by the store. Prefer `fullName` in new code.
- Logout/login both call `tokenStorage.clearQueryCache()` — any new persisted client cache that should follow the same lifecycle must hook into the same callback.
- `useTranslation` does a `require("@/components/providers/language-provider")` to dodge SSR import cycles. Don't restructure the provider so that this require breaks — or replace the dance with a proper context import + a `defaultLocale` SSR fallback.

## Adding a New Feature

1. Create `features/<area>/` with `components/`, `hooks/`, `schemas/`, `index.ts`.
2. Add endpoints to the right group in `lib/api/endpoints.ts`.
3. Add translation keys to **both** `lib/i18n/ar.json` and `lib/i18n/en.json`.
4. Build TanStack Query hooks in `features/<area>/hooks/`; never call `apiClient` directly from a component.
5. Add the route under the matching `app/(<role>)/` group; the route file should mostly compose feature components + a `dashboard-layout` / `public-layout`.
6. If protected, wrap in the appropriate guard from `lib/auth/guards`.
7. Per the cross-repo sync rules above, verify backend contracts match before declaring the feature complete.
