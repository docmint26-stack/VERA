# VERA — Phase 2 Baseline Audit

Date: 2026-11-13 · Scope: what exists at the start of Phase 2, what is missing, and how Phase 2 will close the gap.

## 1. What exists (Phase 1)

| Area | State |
| --- | --- |
| Framework | Next.js 16.4.6 (App Router, Turbopack, `cacheComponents: true`), React 19.3.1, TypeScript 5.9.3, Tailwind 4 |
| UI | Full authenticated shell: dashboard, documents, vault, achievements, verification, passport, opportunities, rewards, activity, notifications, settings, org admin, profile |
| Data | **Mock only.** `src/lib/demo-data.ts` (302 lines) exports static arrays consumed directly by client components |
| Auth | None. `src/lib/api/auth-client.ts` existed only as a placeholder (no Better Auth wiring at audit time) |
| API routes | None besides `/api/health` and `/api/ready` (static responses, no probes) |
| Database | None. No Prisma schema, no migrations, no `.env` |
| Middleware/proxy | None. No route protection; every `/app/*` page rendered for anonymous visitors |
| Jobs | None. No queue, scheduler, or worker |
| Tests | None. No test runner, no test files |
| Docs | Phase 1 only: `docs/architecture/FRONTEND_ARCHITECTURE.md`, `docs/design/*`, `docs/product/PHASE_1_FEATURE_MATRIX.md` |

### Pre-existing defect found during audit

`next build` fails while prerendering `/app/opportunities`:

```
Slot failed to slot onto its children. Expected a single React element child or `Slottable`. (digest 2928260407)
```

Source: `src/app/app/opportunities/page.tsx` → `src/components/app/modules/opportunities-view.tsx`. Must be fixed in Phase 2 for the build to pass.

## 2. What Phase 2 must add

1. PostgreSQL (Prisma 7 + `@prisma/adapter-pg`), schema + migrations for auth, profiles, orgs, vault, documents, achievements, verification, credentials, rewards, notifications/activity/audit, share links, jobs/outbox/idempotency, AI prep tables.
2. Real authentication (Better Auth): sign-up, sign-in, sign-out, email verification, password reset, change password/email, sessions, revocation — all through `/api/auth/*`.
3. Secure object storage behind `ObjectStorageProvider` (local FS default, S3/R2 optional) with presigned upload/download, AV/content validation, owner-only access.
4. Versioned application API `/api/v1/*` (zod-validated, rate-limited, authenticated, cursor-paginated).
5. Multi-user data isolation enforced in the data layer and proven by tests with two distinct users.
6. Achievements, verification states, credentials, rewards/points, notifications, activity, audit log.
7. Organizations with membership/roles and admin-only operations.
8. Background jobs (PostgreSQL-backed queue) + outbox events + idempotency records.
9. Frontend rewiring: every screen reads/writes the real API; demo data retained only where clearly labelled as sample content.
10. Rate limiting, structured redacting logs, health/readiness probes with real dependencies.
11. Tests: unit + integration (two-user isolation, auth flows) + Playwright E2E; `typecheck`, `lint`, `build`, `test` all green.
12. Documentation: architecture, API (OpenAPI), security, deployment, operations, Phase 2 acceptance report.

## 3. Environment constraints discovered

- Windows, Node v22.19.0, npm 10.9.3. **No Docker, no psql, no choco.** Winget available but unused.
- Local PostgreSQL is therefore provisioned in-process with `embedded-postgres` (PG 18.6 binaries) via `scripts/db.ts` — data in `.local/pgdata`, databases `vera` and `vera_test`.
- Next.js 16 breaking changes apply: `middleware.ts` → `proxy.ts`, route handler `ctx.params` is a Promise, `export const dynamic` is **rejected** under `cacheComponents` (use `connection()` from `next/server` instead).
- Prisma 7 requires a driver adapter (`@prisma/adapter-pg`) and Query Compiler; generated client lives in `src/generated/prisma` (git-ignored).

## 4. Verification performed at baseline

- `npm run typecheck` — clean (Phase 1).
- `npm run lint` — clean (Phase 1).
- `next build` — **fails** on `/app/opportunities` (defect above).
- Endpoints at baseline: `/api/health` → `{status:"ok"}`, `/api/ready` → static (no dependency probes).

## 5. Strategy

Build bottom-up and verify continuously: environment + schema + auth first (already smoke-tested end-to-end: sign-up → verification email captured in dev outbox → verify → sign-in → session cookie → `get-session`), then services and `/api/v1`, then frontend rewiring, then jobs/admin/orgs, then tests and docs, then the full verification matrix and the PASS/FAIL report.
