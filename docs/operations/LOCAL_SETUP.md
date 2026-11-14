# Local setup

1. Copy `.env.example` to `.env` and keep `STORAGE_PROVIDER=local`,
   `EMAIL_DELIVERY=dev`, and `EMAIL_DELIVERY_MODE=inline` for a no-cloud setup.
2. Install dependencies with `npm install`.
3. Start the embedded PostgreSQL service with `npm run db:start` in one
   terminal. It creates `vera` and `vera_test` without Docker.
4. Apply versioned migrations with `npm run db:migrate`.
5. Start the app with `npm run dev`.
6. For queued email processing, set `EMAIL_DELIVERY_MODE=queue` and run
   `npm run worker` in another terminal.

`db:start` is the reliable long-running command. The lower-level
`scripts/db.ts create` helper is retained for maintainers but is not part of
the normal setup path.

The default `dev` email provider writes messages to `.local/outbox` and does
not claim delivery. Hosted SMTP, Resend, S3/R2, Upstash, Turnstile, and ClamAV
are opt-in and require real credentials/configuration.

Verification commands:

```text
npm run db:generate
npm run typecheck
npm run lint
$env:RUN_DB_TESTS="1"; npm test -- --reporter=verbose
npm run build
```

When ClamAV is not configured, uploaded objects remain quarantined and cannot
be downloaded. This is intentional fail-closed behavior.
