# VERA Backend Architecture

**Version:** 1.0  
**Phase:** 2  
**Last Updated:** 2024-11-13  

---

## 1. Architecture Overview

VERA Phase 2 implements a **modular monolith** architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                           HTTP Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Next.js    │  │   Better    │  │    API Routes            │  │
│  │   Pages     │  │    Auth     │  │   (/api/v1/*)           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                         Service Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Validation │  │ Rate Limiting│  │  Services   │              │
│  │   (Zod)    │  │   (Upstash) │  │  (Modules)   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                         Data Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ PostgreSQL  │  │  S3/R2       │  │   Redis (Upstash)        │  │
│  │ (Prisma)    │  │ (MinIO)      │  │   (Rate Limiting)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.1 Design Principles

1. **Separation of Concerns:** Route handlers are thin, business logic in services
2. **Dependency Injection:** Services receive dependencies explicitly
3. **Interface-based:** External services use adapters/interfaces
4. **Fail Fast:** Validation and authorization before processing
5. **Audit Everything:** All mutations are logged
6. **Security by Default:** Private by default, explicit sharing

---

## 2. Directory Structure

```
src/
├── app/
│   ├── api/
│   │   ├── v1/                          # Versioned API
│   │   │   ├── auth/                    # Better Auth routes
│   │   │   ├── me/                      # Current user
│   │   │   ├── profiles/                # Public profiles
│   │   │   ├── vault/                   # File storage
│   │   │   ├── documents/               # Document management
│   │   │   ├── achievements/            # Achievement management
│   │   │   ├── notifications/           # User notifications
│   │   │   ├── organizations/           # Organization management
│   │   │   ├── rewards/                 # Rewards system
│   │   │   ├── verification/            # Verification workflow
│   │   │   └── admin/                   # Admin APIs
│   │   ├── auth/                       # Better Auth catch-all
│   │   ├── health/                     # Health checks
│   │   └── ready/                      # Readiness checks
│   └── (marketing)/                    # Public website
│
├── server/
│   ├── auth/                           # Authentication
│   │   ├── auth.ts                     # Better Auth configuration
│   │   └── middleware.ts               # Auth middleware
│   │
│   ├── db/                            # Database
│   │   ├── client.ts                   # Prisma client singleton
│   │   └── index.ts                    # Database exports
│   │
│   ├── modules/                       # Business logic modules
│   │   ├── users/                     # User management
│   │   │   └── service.ts
│   │   ├── profiles/                  # User profiles
│   │   │   └── service.ts
│   │   ├── vault/                     # File storage
│   │   │   └── service.ts
│   │   ├── documents/                 # Document management
│   │   │   └── service.ts
│   │   ├── achievements/              # Achievement management
│   │   │   └── service.ts
│   │   ├── notifications/             # Notification system
│   │   │   └── service.ts
│   │   ├── organizations/             # Organization management
│   │   │   └── service.ts
│   │   ├── rewards/                   # Rewards system
│   │   │   └── service.ts
│   │   ├── verification/              # Verification workflow
│   │   │   └── service.ts
│   │   ├── admin/                     # Admin functions
│   │   │   └── service.ts
│   │   └── common.ts                  # Shared utilities
│   │
│   ├── storage/                       # Object storage
│   │   ├── client.ts                  # Storage client
│   │   ├── upload.ts                  # Upload pipeline
│   │   └── scan.ts                    # File scanning
│   │
│   ├── email/                         # Email service
│   │   ├── client.ts                  # Email provider abstraction
│   │   ├── templates/                 # Email templates
│   │   └── sender.ts                  # Email sender
│   │
│   ├── security/                      # Security
│   │   ├── rate-limit.ts              # Rate limiting
│   │   ├── turnstile.ts               # CAPTCHA integration
│   │   └── middleware.ts              # Security middleware
│   │
│   └── observability/                 # Logging and monitoring
│       ├── logger.ts                  # Structured logger
│       └── metrics.ts                 # Metrics collection
│
├── lib/
│   ├── api/                           # API utilities
│   │   ├── route.ts                   # Route handler framework
│   │   ├── response.ts                # Response utilities
│   │   ├── query.ts                   # Query parsing
│   │   ├── pagination.ts              # Pagination utilities
│   │   └── limits.ts                  # Rate limit presets
│   │
│   ├── config/                        # Configuration
│   │   ├── env.ts                     # Environment validation
│   │   ├── design-tokens.ts           # Design system tokens
│   │   └── constants.ts               # Application constants
│   │
│   ├── errors/                        # Error handling
│   │   └── app-error.ts               # Application error class
│   │
│   └── utils/                         # Utilities
│       └── ...
│
└── generated/
    └── prisma/                        # Prisma generated files
        ├── client.ts
        ├── enums.ts
        └── ...
```

---

## 3. Core Components

### 3.1 Authentication & Authorization

**Library:** Better Auth v0.x  
**Strategy:** Session-based with JWT

#### Authentication Flow
```
1. User submits credentials
2. Better Auth validates
3. Session created (server-side)
4. Secure cookie set
5. User authenticated for subsequent requests
```

#### Authorization Model
```typescript
// Platform Roles
type PlatformRole = 'USER' | 'VERIFIER' | 'ORGANIZATION_ADMIN' | 'PLATFORM_ADMIN'

// Organization Roles
type OrganizationRole = 'MEMBER' | 'ADMIN' | 'OWNER'

// Permission System
- Resource ownership checks (e.g., file.ownerId === user.id)
- Organization membership checks (e.g., orgMember.userId === user.id)
- Platform role checks (e.g., user.role === 'PLATFORM_ADMIN')
- Deny-by-default approach
```

#### Security Features
- ✅ Password hashing (via Better Auth)
- ✅ CSRF protection
- ✅ Session fixation protection
- ✅ Secure cookie configuration
- ✅ User enumeration protection
- ✅ OAuth state validation
- ✅ Redirect URL validation

### 3.2 Database Layer

**ORM:** Prisma 7  
**Database:** PostgreSQL 15+  
**Driver:** `@prisma/adapter-pg` (with PgPool)

#### Schema Design
- **UUID identifiers** for all primary keys
- **Timestamps** (createdAt, updatedAt) on all tables
- **Soft delete** support where appropriate
- **Foreign keys** with cascading behavior
- **Indexes** on frequently queried columns
- **Constraints** for data integrity
- **JSON fields** only for genuinely flexible metadata

#### Connection Management
```typescript
// src/server/db/client.ts
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export function getDb(): PrismaClient { return prisma }
```

### 3.3 Storage Layer

**Primary Provider:** Cloudflare R2  
**Local Development:** MinIO  
**Interface:** S3-compatible API

#### Upload Pipeline
```
1. Client requests upload intent
2. Server validates (quota, file type, size)
3. Server creates pending file record
4. Server generates pre-signed upload URL
5. Client uploads to storage
6. Server confirms upload completion
7. File enters quarantine (scanning)
8. File becomes available (if clean)
9. Storage usage updated
```

#### Security Controls
- ✅ Private buckets by default
- ✅ Server-authorized signed operations
- ✅ Short-lived download URLs (30 seconds)
- ✅ Content-Type enforcement
- ✅ Content-Disposition headers
- ✅ Path traversal prevention
- ✅ Object key generation (not user-controlled)
- ✅ Quota enforcement
- ✅ Cross-user access isolation

### 3.4 Email Service

**Primary Provider:** Resend  
**Local Development:** Mailpit  
**Templates:** Handlebars with VERA branding

#### Supported Email Types
- Email verification
- Password reset
- Email change verification
- Organization invitations
- Security notifications

#### Security Features
- ✅ One-time links with expiration
- ✅ HTML and text alternatives
- ✅ VERA branding
- ✅ Rate limiting
- ✅ Delivery error logging
- ✅ No sensitive data in logs

### 3.5 Rate Limiting

**Primary Provider:** Upstash Redis  
**Local Development:** Local Redis  
**Strategy:** Distributed, atomic operations

#### Rate Limit Profiles
```typescript
// src/lib/api/limits.ts
{
  api: { scope: "api", limit: 240, windowSeconds: 60, by: "user" },
  publicRead: { scope: "public-read", limit: 120, windowSeconds: 60 },
  write: { scope: "write", limit: 60, windowSeconds: 60, by: "user" },
  upload: { scope: "upload", limit: 30, windowSeconds: 60, by: "user" },
  signUp: { scope: "sign-up", limit: 10, windowSeconds: 3600 },
  admin: { scope: "admin", limit: 120, windowSeconds: 60, by: "user" }
}
```

#### Protected Endpoints
- Sign up
- Login
- Password reset
- Email verification resend
- File upload initiation
- Public sharing
- Search
- Sensitive mutations

### 3.6 Anti-Bot Protection

**Provider:** Cloudflare Turnstile  
**Integration:** Server-side token validation

#### Protected Actions
- Sign up
- Login (optional, configurable)
- Password reset
- Public forms

---

## 4. API Design

### 4.1 Versioning

**Strategy:** URL versioning  
**Current Version:** v1  
**Base Path:** `/api/v1/`

**Exception:** Better Auth routes use their own paths (`/api/auth/*`)

### 4.2 Authentication

**Strategy:** Bearer token (session cookie)  
**Headers:** Automatic via cookie  
**Errors:** 401 Unauthorized

### 4.3 Request Validation

**Library:** Zod  
**Strategy:** Schema validation at route level

```typescript
// Example: Create document schema
const createDocumentInput = z.object({
  title: z.string().min(1).max(200),
  folderId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional(),
  content: z.string().max(1000000).optional(),
})

export const POST = apiRoute({
  auth: "required",
  body: createDocumentInput,
  handler: async (ctx) => {
    // ctx.body is validated and typed
    const doc = await documents.createDocument(ctx.user!.id, ctx.body)
    return doc
  }
})
```

### 4.4 Rate Limiting

**Library:** Upstash Redis  
**Implementation:** Middleware-based

```typescript
import { apiRoute } from "@/lib/api/route"
import { limits } from "@/lib/api/limits"

export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write, // Apply rate limit
  body: createInput,
  handler: async (ctx) => {
    // Rate limiting enforced before handler
    // ctx contains: requestId, ip, user, etc.
  }
})
```

### 4.5 Error Handling

**Custom Error Class:** AppError  
**Strategy:** Structured error responses

```typescript
// src/lib/errors/app-error.ts
class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
    public readonly headers?: Record<string, string>
  ) { ... }

  toJSON(requestId: string) {
    return {
      error: {
        code: this.code,
        message: this.message,
        requestId,
        ...(this.details && { details: this.details })
      }
    }
  }
}

// Usage in routes
if (!user) throw errors.unauthenticated()
if (!file) throw errors.notFound("File not found")
```

### 4.6 Response Format

**Success:**
```json
{
  "data": { ... }
}
```

**Error:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "File not found",
    "requestId": "req_xxx"
  }
}
```

**Pagination:**
```json
{
  "data": {
    "items": [...],
    "nextCursor": "...",
    "hasMore": true
  }
}
```

### 4.7 API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/[...all]` | Better Auth catch-all |

#### Current User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/me` | Get current user |
| PATCH | `/api/v1/me` | Update user identity |
| GET | `/api/v1/me/sessions` | List sessions |
| DELETE | `/api/v1/me/sessions/:id` | Revoke session |

#### Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/profiles/:slug` | Get public profile |

#### Vault (File Storage)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/vault` | Get vault info |
| GET | `/api/v1/vault/root` | List root files/folders |
| GET | `/api/v1/vault/usage` | Get storage usage |
| GET | `/api/v1/vault/files` | List files |
| POST | `/api/v1/vault/files` | Create folder |
| GET | `/api/v1/vault/files/:id` | Get file/folder |
| PATCH | `/api/v1/vault/files/:id` | Rename file/folder |
| DELETE | `/api/v1/vault/files/:id` | Delete file/folder |
| POST | `/api/v1/vault/folders` | List folders |
| POST | `/api/v1/vault/folders/:id` | Get folder |
| POST | `/api/v1/vault/upload-intents` | Create upload intent |
| POST | `/api/v1/vault/uploads/:id/complete` | Complete upload |

#### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/documents` | List documents |
| POST | `/api/v1/documents` | Create document |
| GET | `/api/v1/documents/:id` | Get document |
| PATCH | `/api/v1/documents/:id` | Update document |
| DELETE | `/api/v1/documents/:id` | Delete document |
| GET | `/api/v1/documents/:id/versions` | List versions |
| POST | `/api/v1/documents/:id/publish` | Publish document |
| POST | `/api/v1/documents/:id/versions/:version/restore` | Restore version |

#### Achievements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/achievements` | List achievements |
| POST | `/api/v1/achievements` | Create achievement |
| GET | `/api/v1/achievements/:id` | Get achievement |
| PATCH | `/api/v1/achievements/:id` | Update achievement |
| DELETE | `/api/v1/achievements/:id` | Delete achievement |
| GET | `/api/v1/achievements/:id/evidence` | List evidence |
| POST | `/api/v1/achievements/:id/evidence` | Add evidence |
| DELETE | `/api/v1/achievements/:id/evidence/:evidenceId` | Remove evidence |
| GET | `/api/v1/achievements/:id/skills` | List skills |
| POST | `/api/v1/achievements/:id/skills` | Add skill |
| DELETE | `/api/v1/achievements/:id/skills/:skillId` | Remove skill |

#### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | List notifications |
| PATCH | `/api/v1/notifications/:id` | Mark as read |

#### Organizations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/organizations` | List organizations |
| POST | `/api/v1/organizations` | Create organization |
| GET | `/api/v1/organizations/:id` | Get organization |
| PATCH | `/api/v1/organizations/:id` | Update organization |
| DELETE | `/api/v1/organizations/:id` | Delete organization |
| GET | `/api/v1/organizations/:id/members` | List members |
| POST | `/api/v1/organizations/:id/members` | Add member |
| PATCH | `/api/v1/organizations/:id/members/:memberId` | Update member |
| DELETE | `/api/v1/organizations/:id/members/:memberId` | Remove member |
| GET | `/api/v1/organizations/:id/invitations` | List invitations |
| POST | `/api/v1/organizations/:id/invitations` | Create invitation |
| POST | `/api/v1/organizations/invitations/:token/accept` | Accept invitation |
| POST | `/api/v1/organizations/invitations/:token/decline` | Decline invitation |
| DELETE | `/api/v1/organizations/:id/invitations/:invitationId/revoke` | Revoke invitation |

#### Rewards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/rewards` | Get reward account and transactions |
| GET | `/api/v1/rewards/balance` | Get balance only |
| GET | `/api/v1/rewards/transactions` | List transactions |
| GET | `/api/v1/rewards/transactions/:id` | Get transaction |
| GET | `/api/v1/rewards/rules` | List reward rules |

#### Verification
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/verification/requests` | List verification requests |
| POST | `/api/v1/verification/requests` | Create request |
| GET | `/api/v1/verification/requests/:id` | Get request |
| PATCH | `/api/v1/verification/requests/:id` | Update request |
| DELETE | `/api/v1/verification/requests/:id` | Cancel request |
| POST | `/api/v1/verification/requests/:id/evidence` | Add evidence |
| GET | `/api/v1/verification/credentials` | List credentials |
| GET | `/api/v1/verification/credentials/:id` | Get credential |

#### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | List users |
| GET | `/api/v1/admin/users/:id` | Get user |
| GET | `/api/v1/admin/stats` | Get system stats |

---

## 5. Data Models

### 5.1 Core Entities

#### User
```typescript
{
  id: string (UUID)
  name: string
  email: string
  emailVerified: boolean
  image: string?
  role: PlatformRole
  status: UserStatus
  slug: string?
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### UserProfile
```typescript
{
  id: string (UUID)
  userId: string (FK)
  headline: string?
  bio: string?
  location: string?
  occupation: string?
  language: string
  timezone: string?
  // ...
}
```

#### Organization
```typescript
{
  id: string (UUID)
  name: string
  slug: string
  description: string?
  logo: string?
  website: string?
  isVerifiedIssuer: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### 5.2 Storage

#### VaultFile
```typescript
{
  id: string (UUID)
  ownerId: string (FK)
  folderId: string? (FK)
  originalFilename: string
  storageKey: string
  mimeType: string
  size: number
  checksum: string
  status: FileStatus
  scanStatus: ScanStatus
  // ...
}
```

### 5.3 Documents

#### Document
```typescript
{
  id: string (UUID)
  ownerId: string (FK)
  title: string
  slug: string?
  folderId: string?
  templateId: string?
  content: Json
  status: DocumentStatus
  visibility: Visibility
  version: number
  // ...
}
```

### 5.4 Achievements

#### Achievement
```typescript
{
  id: string (UUID)
  ownerId: string (FK)
  type: AchievementType
  title: string
  description: string?
  issuer: string?
  periodStart: DateTime?
  periodEnd: DateTime?
  status: ClaimStatus
  visibility: Visibility
  // ...
}
```

### 5.5 Verification

#### VerificationRequest
```typescript
{
  id: string (UUID)
  requesterId: string (FK)
  achievementId: string? (FK)
  verifierId: string? (FK)
  organizationId: string? (FK)
  channel: VerificationChannel
  status: VerificationStatus
  message: string?
  decidedAt: DateTime?
  // ...
}
```

#### CredentialRecord
```typescript
{
  id: string (UUID)
  subjectId: string (FK)
  issuerOrganizationId: string? (FK)
  achievementId: string? (FK)
  type: string
  schemaVersion: string
  status: CredentialStatus
  issuanceDate: DateTime
  expirationDate: DateTime?
  context: Json?
  credentialSubject: Json?
  // ...
}
```

### 5.6 Rewards

#### RewardAccount
```typescript
{
  id: string (UUID)
  userId: string (FK, unique)
  balance: bigint
  lifetimeEarned: bigint
  lifetimeRedeemed: bigint
  version: number (for optimistic locking)
  // ...
}
```

#### RewardTransaction
```typescript
{
  id: string (UUID)
  accountId: string (FK)
  userId: string (FK)
  amount: bigint
  type: RewardTransactionType
  status: RewardTransactionStatus
  reason: string
  idempotencyKey: string (unique)
  relatedType: string?
  relatedId: string?
  metadata: Json?
  // ...
}
```

---

## 6. Security Architecture

### 6.1 Authentication Security

- ✅ Secure password hashing (Argon2id via Better Auth)
- ✅ Session cookies with HttpOnly, Secure, SameSite flags
- ✅ CSRF protection via state tokens
- ✅ Session fixation protection (regenerate session ID on login)
- ✅ User enumeration protection (generic error messages)
- ✅ OAuth state validation
- ✅ Redirect URL validation (allowlist)

### 6.2 Authorization Security

- ✅ Server-side authorization checks
- ✅ Resource ownership validation
- ✅ Organization membership validation
- ✅ Platform role checks
- ✅ Deny-by-default approach
- ✅ No client-side-only checks for sensitive operations

### 6.3 Data Security

- ✅ Field-level access control
- ✅ No sensitive data in API responses (unless explicitly requested by owner)
- ✅ Private by default (all user data is private unless shared)
- ✅ Secure file storage (private buckets, signed URLs)
- ✅ No plaintext secrets in database

### 6.4 API Security

- ✅ Rate limiting on all public and sensitive endpoints
- ✅ Input validation on all endpoints
- ✅ Output sanitization
- ✅ No information leakage through error messages
- ✅ CORS configured narrowly
- ✅ Security headers (CSP, XSS protection, etc.)

### 6.5 Abuse Prevention

- ✅ IP-based rate limiting
- ✅ User-based rate limiting
- ✅ Endpoint-specific rate limiting
- ✅ Cloudflare Turnstile integration
- ✅ Upload quotas and file size limits
- ✅ File type validation
- ✅ Malware scanning (quarantine pending)

---

## 7. Performance Considerations

### 7.1 Database Optimization

- ✅ Indexes on frequently queried columns
- ✅ Cursor-based pagination
- ✅ Bounded query results
- ✅ Avoid N+1 queries
- ✅ Connection pooling
- ✅ Transaction timeouts
- ✅ Lazy loading of heavy data

### 7.2 API Performance

- ✅ Code splitting for heavy features
- ✅ Response compression
- ✅ Efficient serialization
- ✅ Caching where safe (no private data caching)
- ✅ Optimized file downloads (streaming)

### 7.3 Storage Performance

- ✅ Chunked uploads for large files
- ✅ Parallel upload support (future)
- ✅ Progress tracking
- ✅ Resumable uploads (future)

---

## 8. Monitoring & Observability

### 8.1 Logging

- ✅ Structured JSON logs
- ✅ Request IDs for tracing
- ✅ Error classification
- ✅ Duration tracking
- ✅ Safe user correlation (no PII in logs)

### 8.2 Metrics

- ✅ Request counts
- ✅ Error rates
- ✅ Response times
- ✅ Database query performance
- ✅ Storage operations
- ✅ Email delivery
- ✅ Background job execution

### 8.3 Health Checks

- ✅ `/api/health` - Overall health
- ✅ `/api/ready` - Readiness
- ✅ Database connectivity
- ✅ Storage connectivity
- ✅ Background worker status

---

## 9. Local Development

### 9.1 Required Services

- PostgreSQL (Docker)
- Redis (Docker)
- MinIO (Docker)
- Mailpit (Docker)

### 9.2 Configuration

```bash
# Start development services
docker-compose up -d postgres redis minio mailpit

# Run database migrations
npx prisma migrate dev

# Seed development data
npx prisma db seed

# Start development server
npm run dev

# Start background worker (in separate terminal)
npm run worker:dev
```

### 9.3 Environment Variables

See [Local Setup Documentation](../operations/LOCAL_SETUP.md)

---

## 10. Deployment Architecture

### 10.1 Production Stack

- **Hosting:** Vercel (Frontend + Edge Functions)
- **Database:** Neon (Managed PostgreSQL)
- **Storage:** Cloudflare R2
- **Email:** Resend
- **Rate Limiting:** Upstash Redis
- **Anti-Bot:** Cloudflare Turnstile

### 10.2 Deployment Strategy

- **Frontend:** Vercel deployments
- **Backend:** Vercel serverless functions
- **Database:** Neon with automated backups
- **Storage:** Cloudflare R2 with lifecycle policies
- **Worker:** Vercel cron triggers or separate worker service

### 10.3 Scaling

- **Database:** Neon auto-scaling
- **Storage:** Cloudflare R2 (unlimited scale)
- **API:** Vercel auto-scaling
- **Worker:** Horizontal scaling

---

## 11. Future Considerations

### 11.1 Phase 3 (AI Integration)
- AI chat conversations
- Document generation
- AI-assisted features
- Usage tracking and quotas

### 11.2 Phase 4 (Web3 & Rewards)
- Blockchain verification (optional)
- Cryptographic credentials
- Rewards activation and earning
- Rewards redemption

### 11.3 Phase 5 (Advanced Features)
- Advanced analytics
- Machine learning recommendations
- Integration marketplace
- API for third-party developers

---

## 12. References

- [Phase 1 Architecture](../FRONTEND_ARCHITECTURE.md)
- [Database Schema](../database/DATABASE_SCHEMA.md)
- [API Documentation](../api/OPENAPI.yaml)
- [Local Setup](../operations/LOCAL_SETUP.md)
- [Deployment Runbook](../operations/DEPLOYMENT_RUNBOOK.md)
