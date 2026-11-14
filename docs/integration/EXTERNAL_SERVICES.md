# External services and release gates

| Service | Local behavior | Hosted verification |
|---|---|---|
| PostgreSQL | Embedded PostgreSQL runner | Neon or another PostgreSQL provider |
| Email | Dev outbox, or SMTP/Mailpit when configured | Resend/SMTP with a verified sender |
| Object storage | Private local filesystem | Cloudflare R2/S3-compatible bucket |
| Malware scanning | Quarantine when ClamAV is absent | ClamAV daemon must answer successfully |
| Rate limiting | PostgreSQL driver by default | Upstash REST can be selected |
| Google OAuth | Disabled unless both credentials exist | Requires a real Google client and callback URL |

Local emulator tests must not be reported as hosted-provider verification.
Missing hosted credentials are external blockers, not reasons to bypass a
security control.
