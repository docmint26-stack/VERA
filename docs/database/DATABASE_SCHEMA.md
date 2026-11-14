# VERA Database Schema

**Version:** 1.0  
**Phase:** 2  
**ORM:** Prisma 7  
**Database:** PostgreSQL 15+  
**Last Updated:** 2024-11-13  

---

## 1. Schema Overview

The VERA database contains **40+ models** organized into logical domains:

1. **Authentication & Users** - User accounts, sessions, OAuth
2. **Profiles & Preferences** - User profiles, settings, privacy
3. **Organizations** - Organizations, members, invitations
4. **Storage (Vault)** - Files, folders, storage usage
5. **Documents** - Documents, versions, templates
6. **Achievements** - Achievements, evidence, skills
7. **Verification** - Verification requests, evidence, credentials
8. **Rewards** - Reward accounts, transactions, rules
9. **Notifications & Activity** - Notifications, audit logs, activity
10. **System** - Background jobs, outbox, idempotency, consents

---

## 2. Design Principles

### 2.1 Naming Conventions

- **Tables:** PascalCase (Prisma default)
- **Columns:** camelCase (Prisma default)
- **Primary Keys:** UUID (`String @id @default(uuid())`)
- **Foreign Keys:** `[referencedTable]Id` (e.g., `userId`, `ownerId`)
- **Timestamps:** `createdAt`, `updatedAt` on all mutable tables
- **Enums:** PascalCase, singular (e.g., `PlatformRole`, `ClaimStatus`)

### 2.2 Data Types

| Concept | Type | Notes |
|---------|------|-------|
| Identifiers | `String` (UUID) | All primary keys |
| Timestamps | `DateTime` | ISO 8601 strings |
| Text | `String` | Max length enforced at application level |
| Long text | `String` | For descriptions, content |
| JSON | `Json` | Only for genuinely flexible metadata |
| Numbers | `Int` / `BigInt` | BigInt for rewards balance |
| Booleans | `Boolean` | Default false unless specified |

### 2.3 Constraints

- **Required fields:** All non-optional fields are required
- **Unique constraints:** Enforced at database level
- **Foreign keys:** Cascading behavior configured per relationship
- **Indexes:** Created for frequently queried columns
- **Checks:** Database-level validation where appropriate

---

## 3. Enums

### 3.1 Authentication & Authorization

```prisma
# Platform-level roles
enum PlatformRole {
  USER              # Regular user
  VERIFIER          # Can verify credentials
  ORGANIZATION_ADMIN # Can manage organization settings
  PLATFORM_ADMIN    # Full platform access
}

# User account status
enum AccountStatus {
  ACTIVE
  SUSPENDED
  DELETION_REQUESTED
  DELETED
}

# Organization roles
enum OrgRole {
  OWNER
  ADMIN
  MEMBER
}

# Organization status
enum OrgStatus {
  ACTIVE
  SUSPENDED
}

# Invitation lifecycle
enum InvitationStatus {
  PENDING
  ACCEPTED
  DECLINED
  EXPIRED
  REVOKED
}
```

### 3.2 Content & Visibility

```prisma
# Profile visibility levels
enum ProfileVisibility {
  PUBLIC        # Anyone can view
  LINK_ONLY     # Only via direct link
  PRIVATE       # Only owner
}

# Content visibility
enum ContentVisibility {
  PUBLIC
  PRIVATE
}
```

### 3.3 Storage

```prisma
# File upload lifecycle
enum UploadStatus {
  PENDING        # Upload not started
  UPLOADING      # Upload in progress
  PROCESSING     # Post-upload processing
  AVAILABLE      # Ready for use
  REJECTED       # Upload rejected (invalid type, etc.)
  QUARANTINED    # Security scan failed
  FAILED         # Upload failed
}

# File scan status
enum ScanStatus {
  PENDING
  CLEAN         # No issues found
  MALWARE       # Malware detected
  UNSAFE        # Potentially unsafe content
  ERROR         # Scan failed
}
```

### 3.4 Achievements & Verification

```prisma
# Achievement categories
enum AchievementType {
  PROJECT
  EMPLOYMENT
  EDUCATION
  RESEARCH
  COMPETITION
  CERTIFICATION
  TRAINING
  COMMUNITY_CONTRIBUTION
  OTHER
}

# Claim lifecycle
enum ClaimStatus {
  CLAIMED              # User submitted
  VERIFICATION_PENDING # Verification requested
  VERIFIED             # Verified by issuer
  REJECTED             # Verification failed
  REVOKED              # Previously verified, now revoked
}

# Verification channels
enum VerificationChannel {
  ORGANIZATION  # Organization-initiated
  PLATFORM      # Platform-initiated
  EMAIL         # Email-based verification
}

# Verification request status
enum VerificationStatus {
  PENDING       # Waiting for review
  IN_REVIEW     # Being reviewed
  APPROVED      # Approved
  REJECTED      # Rejected
  CANCELLED     # Cancelled by requester
}

# Credential status
enum CredentialStatus {
  ISSUED
  SUSPENDED
  REVOKED
  EXPIRED
}

# Evidence types (for verification)
enum EvidenceType {
  FILE            # Uploaded file
  URL             # External URL
  TEXT            # Text evidence
  LINKED_FILE     # Reference to Vault file
  EXTERNAL_REF    # External reference
}
```

### 3.5 Rewards

```prisma
# Transaction types
enum RewardTransactionType {
  EARN       # Points earned
  REDEEM     # Points redeemed
  ADJUST     # Manual adjustment
  REVERSAL   # Transaction reversal
}

# Transaction status
enum RewardTransactionStatus {
  PENDING
  POSTED
  FAILED
}
```

### 3.6 Notifications & System

```prisma
# Notification categories
enum NotificationType {
  ACCOUNT_VERIFIED
  FILE_UPLOADED
  DOCUMENT_SAVED
  ACHIEVEMENT_SUBMITTED
  VERIFICATION_REQUEST_RECEIVED
  CREDENTIAL_STATUS_UPDATED
  SECURITY_EVENT
  ORGANIZATION_INVITATION
  SYSTEM
}

# Share resource types
enum ShareResourceType {
  FILE
  FOLDER
  PROFILE
  ACHIEVEMENT
  DOCUMENT
}

# Share permissions
enum SharePermission {
  READ
}

# Background job status
enum JobStatus {
  QUEUED
  RUNNING
  SUCCEEDED
  FAILED
  DEAD
}

# Outbox event status
enum OutboxStatus {
  PENDING
  PROCESSING
  PROCESSED
  FAILED
}

# Consent purposes
enum ConsentPurpose {
  TERMS
  PRIVACY_POLICY
  MARKETING
  AI_DATA_ACCESS
}

# Idempotency tracking
enum IdempotencyStatus {
  IN_PROGRESS
  COMPLETED
}

# Chat message roles (for future AI)
enum ChatRole {
  SYSTEM
  USER
  ASSISTANT
}

# Document status
enum DocumentStatus {
  DRAFT
  PUBLISHED
}
```

---

## 4. Model Reference

### 4.1 Authentication (Better Auth)

These models are generated by Better Auth and should not be modified manually.

#### User
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          PlatformRole @default(USER)
  status        AccountStatus @default(ACTIVE)
  slug          String?   @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  profile       UserProfile?
  preferences   UserPreference?
  privacy       UserPrivacySetting?
  skills        UserSkill[]
  educations    UserEducation[]
  experiences   UserExperience[]
  socialLinks   UserSocialLink[]
  consents      UserConsent[]
  notifications UserNotification[]
  files         VaultFile[]
  documents     Document[]
  achievements  Achievement[]
  rewardAccount RewardAccount?
  requests      VerificationRequest[] @relation("VerificationRequester")
  verificationReviews VerificationRequest[] @relation("VerificationVerifier")
  credentials   CredentialRecord[]
  rewardTransactions RewardTransaction[]
  activityEvents ActivityEvent[]
}
```

#### Session
```prisma
model Session {
  id           String   @id
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([sessionToken])
}
```

#### Account (OAuth)
```prisma
model Account {
  id                String  @id
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state    String?
  user             User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}
```

#### Verification (Email verification)
```prisma
model Verification {
  id         String   @id
  identifier String
  token      String   @unique
  expires    DateTime

  @@index([identifier])
  @@index([token])
}
```

---

### 4.2 Profiles & Preferences

#### UserProfile
```prisma
model UserProfile {
  id          String           @id @default(uuid())
  userId      String           @unique
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  headline    String?          @db.VarChar(160)
  bio         String?          @db.Text
  location    String?          @db.VarChar(120)
  occupation  String?          @db.VarChar(120)
  language    String           @default("en")
  timezone    String?
  dateOfBirth DateTime?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([userId])
}
```

#### UserPreference
```prisma
model UserPreference {
  id               String    @id @default(uuid())
  userId           String    @unique
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  theme            String    @default("system")
  fontSize         String    @default("medium")
  reducedMotion    Boolean   @default(false)
  notifications    Json?     @default("{}")
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

#### UserPrivacySetting
```prisma
model UserPrivacySetting {
  id           String           @id @default(uuid())
  userId       String           @unique
  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  profileVisibility ProfileVisibility @default(PRIVATE)
  searchable   Boolean          @default(false)
  showEmail    Boolean          @default(false)
  showLocation Boolean          @default(false)
  aiDataAccess Boolean          @default(false)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}
```

---

### 4.3 Social & Professional Data

#### UserSkill
```prisma
model UserSkill {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String    @db.VarChar(100)
  category  String?   @db.VarChar(50)
  level     Int?      @default(1)
  order     Int       @default(0)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@unique([userId, name])
  @@index([userId, order])
}
```

#### UserEducation
```prisma
model UserEducation {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  institution String    @db.VarChar(200)
  degree      String?   @db.VarChar(200)
  field       String?   @db.VarChar(200)
  startDate   DateTime?
  endDate     DateTime?
  current     Boolean   @default(false)
  order       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId, order])
}
```

#### UserExperience
```prisma
model UserExperience {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String    @db.VarChar(200)
  organization String   @db.VarChar(200)
  description String?   @db.Text
  startDate   DateTime?
  endDate     DateTime?
  current     Boolean   @default(false)
  order       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId, order])
}
```

#### UserSocialLink
```prisma
model UserSocialLink {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  platform  String   @db.VarChar(50)
  url       String   @db.VarChar(500)
  public    Boolean  @default(false)
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, platform])
  @@index([userId, order])
}
```

---

### 4.4 Organizations

#### Organization
```prisma
model Organization {
  id              String      @id @default(uuid())
  name            String      @db.VarChar(200)
  slug            String      @unique @db.VarChar(100)
  description     String?     @db.Text
  logo            String?     @db.VarChar(500)
  website         String?     @db.VarChar(500)
  email           String?     @db.VarChar(255)
  isVerifiedIssuer Boolean   @default(false)
  status          OrgStatus   @default(ACTIVE)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  members         OrganizationMember[]
  invitations     OrganizationInvitation[]
  files           VaultFile[]
  documents       Document[]
  achievements    Achievement[]
  rewardRules     RewardRule[]
  credentials     CredentialRecord[]
  requests        VerificationRequest[]

  @@index([slug])
  @@index([isVerifiedIssuer])
}
```

#### OrganizationMember
```prisma
model OrganizationMember {
  id          String   @id @default(uuid())
  organizationId String
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role        OrgRole   @default(MEMBER)
  joinedAt    DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([organizationId, userId])
  @@index([organizationId])
  @@index([userId])
}
```

#### OrganizationInvitation
```prisma
model OrganizationInvitation {
  id              String          @id @default(uuid())
  organizationId  String
  organization    Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  email           String          @db.VarChar(255)
  role            OrgRole         @default(MEMBER)
  status          InvitationStatus @default(PENDING)
  token           String          @unique
  invitedById     String
  invitedBy       User            @relation(fields: [invitedById], references: [id])
  expiresAt       DateTime        @default(now() + 7 * 24 * 60 * 60 * 1000)
  acceptedAt      DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([organizationId])
  @@index([email])
  @@index([token])
  @@index([status])
}
```

---

### 4.5 Storage (Vault)

#### VaultFolder
```prisma
model VaultFolder {
  id          String   @id @default(uuid())
  name        String   @db.VarChar(255)
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  parentId    String?
  parent      VaultFolder? @relation("FolderHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    VaultFolder[] @relation("FolderHierarchy")
  files       VaultFile[]
  path        String   @db.VarChar(1000)
  visibility  ContentVisibility @default(PRIVATE)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  @@unique([ownerId, parentId, name])
  @@index([ownerId, parentId])
  @@index([ownerId, deletedAt])
  @@index([path])
}
```

#### VaultFile
```prisma
model VaultFile {
  id               String             @id @default(uuid())
  ownerId          String
  owner            User               @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  organizationId   String?
  organization     Organization?      @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  folderId         String?
  folder           VaultFolder?       @relation(fields: [folderId], references: [id], onDelete: SetNull)
  originalFilename String             @db.VarChar(255)
  storageKey       String             @unique
  mimeType         String             @db.VarChar(100)
  size             Int
  checksum         String             @db.VarChar(64)
  status           UploadStatus       @default(PENDING)
  scanStatus       ScanStatus         @default(PENDING)
  visibility       ContentVisibility  @default(PRIVATE)
  versions         VaultFileVersion[]
  shares           FileAccessGrant[]
  order            Int                @default(0)
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  deletedAt        DateTime?

  @@index([ownerId, folderId])
  @@index([ownerId, deletedAt])
  @@index([organizationId])
  @@index([status])
  @@index([scanStatus])
  @@index([storageKey])
}
```

#### VaultFileVersion
```prisma
model VaultFileVersion {
  id        String   @id @default(uuid())
  fileId    String
  file      VaultFile @relation(fields: [fileId], references: [id], onDelete: Cascade)
  storageKey String
  mimeType  String   @db.VarChar(100)
  size      Int
  checksum  String   @db.VarChar(64)
  version   Int
  createdAt DateTime @default(now())

  @@unique([fileId, version])
  @@index([fileId])
}
```

#### FileAccessGrant (Share Links)
```prisma
model FileAccessGrant {
  id          String           @id @default(uuid())
  fileId      String
  file        VaultFile         @relation(fields: [fileId], references: [id], onDelete: Cascade)
  folderId    String?
  folder      VaultFolder?      @relation(fields: [folderId], references: [id], onDelete: SetNull)
  token       String           @unique
  permission  SharePermission  @default(READ)
  expiresAt   DateTime?
  maxViews    Int?
  viewCount   Int              @default(0)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([token])
  @@index([fileId])
  @@index([expiresAt])
}
```

#### StorageUsage
```prisma
model StorageUsage {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  totalBytes BigInt  @default(0)
  fileCount Int      @default(0)
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

---

### 4.6 Documents

#### Document
```prisma
model Document {
  id          String          @id @default(uuid())
  ownerId     String
  owner       User            @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  organizationId String?
  organization Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  folderId    String?
  folder      VaultFolder?     @relation(fields: [folderId], references: [id], onDelete: SetNull)
  title       String          @db.VarChar(200)
  slug        String?         @db.VarChar(200)
  templateId  String?
  content     Json
  status      DocumentStatus  @default(DRAFT)
  visibility  ContentVisibility @default(PRIVATE)
  version     Int             @default(1)
  wordCount   Int?
  characterCount Int?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  deletedAt   DateTime?

  versions     DocumentVersion[]
  shares       ShareLink[]
  achievements Achievement[]

  @@unique([ownerId, slug])
  @@index([ownerId, folderId])
  @@index([ownerId, deletedAt])
  @@index([organizationId])
}
```

#### DocumentVersion
```prisma
model DocumentVersion {
  id          String   @id @default(uuid())
  documentId  String
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  content     Json
  version     Int
  wordCount   Int?
  characterCount Int?
  createdAt   DateTime @default(now())

  @@unique([documentId, version])
  @@index([documentId])
}
```

#### DocumentTemplateReference
```prisma
model DocumentTemplateReference {
  id          String   @id @default(uuid())
  documentId  String   @unique
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  templateType String   @db.VarChar(50)
  templateName String   @db.VarChar(100)
  createdAt   DateTime @default(now())
}
```

---

### 4.7 Achievements

#### Achievement
```prisma
model Achievement {
  id          String           @id @default(uuid())
  ownerId     String
  owner       User             @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  organizationId String?
  organization Organization?  @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  type        AchievementType
  title       String           @db.VarChar(200)
  description String?          @db.Text
  issuer      String?          @db.VarChar(200)
  issuerUrl   String?          @db.VarChar(500)
  periodStart DateTime?
  periodEnd   DateTime?
  location    String?          @db.VarChar(200)
  status      ClaimStatus       @default(CLAIMED)
  visibility  ContentVisibility @default(PRIVATE)
  order       Int              @default(0)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  deletedAt   DateTime?

  evidence    AchievementEvidence[]
  skills      AchievementSkill[]
  history     AchievementHistory[]
  requests    VerificationRequest[]
  credentials CredentialRecord[]
  documents   Document[]

  @@index([ownerId, deletedAt])
  @@index([ownerId, type])
  @@index([ownerId, status])
  @@index([organizationId])
}
```

#### AchievementEvidence
```prisma
model AchievementEvidence {
  id          String   @id @default(uuid())
  achievementId String
  achievement  Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  type        EvidenceType
  url         String?   @db.VarChar(500)
  fileId      String?
  file        VaultFile? @relation(fields: [fileId], references: [id], onDelete: SetNull)
  note        String?   @db.VarChar(400)
  order       Int      @default(0)
  createdAt   DateTime @default(now())

  @@index([achievementId])
}
```

#### AchievementSkill
```prisma
model AchievementSkill {
  id          String    @id @default(uuid())
  achievementId String
  achievement  Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  name        String    @db.VarChar(100)
  category    String?   @db.VarChar(50)
  level       Int?      @default(1)
  order       Int       @default(0)
  createdAt   DateTime  @default(now())

  @@unique([achievementId, name])
  @@index([achievementId])
}
```

#### AchievementHistory
```prisma
model AchievementHistory {
  id          String   @id @default(uuid())
  achievementId String
  achievement  Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  action      String   @db.VarChar(50)
  fromStatus ClaimStatus?
  toStatus   ClaimStatus?
  note       String?   @db.VarChar(500)
  createdAt  DateTime @default(now())

  @@index([achievementId])
  @@index([createdAt])
}
```

---

### 4.8 Verification

#### VerificationRequest
```prisma
model VerificationRequest {
  id             String             @id @default(uuid())
  requesterId    String
  requester     User               @relation("VerificationRequester", fields: [requesterId], references: [id], onDelete: Cascade)
  achievementId  String?
  achievement    Achievement?       @relation(fields: [achievementId], references: [id], onDelete: SetNull)
  verifierId     String?
  verifier      User?              @relation("VerificationVerifier", fields: [verifierId], references: [id], onDelete: SetNull)
  organizationId String?
  organization  Organization?     @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  channel        VerificationChannel @default(ORGANIZATION)
  status         VerificationStatus  @default(PENDING)
  message        String?
  decidedAt      DateTime?
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt

  requester    User                @relation("VerificationRequester", fields: [requesterId], references: [id], onDelete: Cascade)
  verifier     User?               @relation("VerificationVerifier", fields: [verifierId], references: [id], onDelete: SetNull)
  organization Organization?       @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  achievement  Achievement?         @relation(fields: [achievementId], references: [id], onDelete: SetNull)
  evidence     VerificationEvidence[]
  events       VerificationEvent[]

  @@index([requesterId, createdAt])
  @@index([verifierId])
  @@index([organizationId])
  @@index([status, createdAt])
}
```

#### VerificationEvidence
```prisma
model VerificationEvidence {
  id        String             @id @default(uuid())
  requestId String
  request   VerificationRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  type      EvidenceType
  url       String?             @db.VarChar(500)
  fileId    String?
  file      VaultFile?          @relation(fields: [fileId], references: [id], onDelete: SetNull)
  note      String?             @db.VarChar(400)
  createdAt DateTime           @default(now())

  @@index([requestId])
}
```

#### VerificationEvent
```prisma
model VerificationEvent {
  id          String             @id @default(uuid())
  requestId   String
  request     VerificationRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  actorId     String
  action      String             @db.VarChar(50)
  fromStatus VerificationStatus?
  toStatus   VerificationStatus?
  note       String?             @db.VarChar(500)
  createdAt  DateTime           @default(now())

  @@index([requestId])
  @@index([actorId])
  @@index([createdAt])
}
```

#### CredentialRecord
```prisma
model CredentialRecord {
  id                    String           @id @default(uuid())
  subjectId             String
  subject               User             @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  issuerOrganizationId  String?
  issuer                Organization?   @relation(fields: [issuerOrganizationId], references: [id], onDelete: SetNull)
  achievementId         String?
  achievement           Achievement?    @relation(fields: [achievementId], references: [id], onDelete: SetNull)
  type                  String           @default("VerifiableCredential")
  schemaVersion         String           @default("1.0")
  status                CredentialStatus @default(ISSUED)
  issuanceDate          DateTime         @default(now())
  expirationDate        DateTime?
  context               Json?
  credentialSubject     Json?
  proof                 Json?
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt

  subject              User             @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  issuer               Organization?   @relation(fields: [issuerOrganizationId], references: [id], onDelete: SetNull)
  achievement          Achievement?    @relation(fields: [achievementId], references: [id], onDelete: SetNull)
  statusEvents         CredentialStatusEvent[]

  @@index([subjectId, status])
  @@index([issuerOrganizationId])
  @@index([achievementId])
}
```

#### CredentialStatusEvent
```prisma
model CredentialStatusEvent {
  id          String           @id @default(uuid())
  credentialId String
  credential   CredentialRecord @relation(fields: [credentialId], references: [id], onDelete: Cascade)
  actorId     String
  action      String           @db.VarChar(50)
  fromStatus CredentialStatus?
  toStatus   CredentialStatus?
  reason      String?
  createdAt  DateTime         @default(now())

  @@index([credentialId])
  @@index([actorId])
}
```

---

### 4.9 Rewards

#### RewardAccount
```prisma
model RewardAccount {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  balance         BigInt   @default(0)
  lifetimeEarned  BigInt   @default(0)
  lifetimeRedeemed BigInt @default(0)
  version         Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  transactions RewardTransaction[]

  @@index([userId])
}
```

#### RewardTransaction
```prisma
model RewardTransaction {
  id            String               @id @default(uuid())
  accountId     String
  account       RewardAccount        @relation(fields: [accountId], references: [id], onDelete: Cascade)
  userId        String
  user          User                 @relation(fields: [userId], references: [id])
  amount        BigInt
  type          RewardTransactionType
  status        RewardTransactionStatus @default(POSTED)
  reason        String               @db.VarChar(200)
  idempotencyKey String              @unique
  relatedType   String?              @db.VarChar(50)
  relatedId     String?              @db.VarChar(100)
  metadata      Json?
  createdAt     DateTime             @default(now())

  @@index([accountId])
  @@index([userId])
  @@index([type, createdAt])
  @@index([idempotencyKey])
}
```

#### RewardRule
```prisma
model RewardRule {
  id              String   @id @default(uuid())
  code            String   @unique @db.VarChar(50)
  name            String   @db.VarChar(100)
  description     String?  @db.Text
  points          BigInt
  active          Boolean  @default(false)
  organizationId  String?
  organization    Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  cooldownSeconds Int      @default(0)
  maxPerUser      Int?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([code])
  @@index([organizationId])
  @@index([active])
}
```

#### RewardEvent
```prisma
model RewardEvent {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ruleId      String?
  rule        RewardRule? @relation(fields: [ruleId], references: [id], onDelete: SetNull)
  action      String   @db.VarChar(50)
  points      BigInt
  relatedType String?  @db.VarChar(50)
  relatedId   String?  @db.VarChar(100)
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([ruleId])
  @@index([createdAt])
}
```

---

### 4.10 Notifications & Activity

#### UserNotification
```prisma
model UserNotification {
  id          String          @id @default(uuid())
  userId      String
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        NotificationType
  title       String          @db.VarChar(200)
  body        String          @db.Text
  link        String?         @db.VarChar(500)
  data        Json?
  read        Boolean         @default(false)
  createdAt   DateTime        @default(now())

  @@index([userId, createdAt])
  @@index([userId, read])
}
```

#### ActivityEvent
```prisma
model ActivityEvent {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  action      String   @db.VarChar(50)
  resourceType String   @db.VarChar(50)
  resourceId String   @db.VarChar(100)
  data        Json?
  ip          String?   @db.VarChar(45)
  userAgent   String?   @db.VarChar(500)
  createdAt   DateTime @default(now())

  @@index([userId, createdAt])
  @@index([action])
}
```

#### AuditLog
```prisma
model AuditLog {
  id          String   @id @default(uuid())
  actorId     String?
  action      String   @db.VarChar(100)
  targetType  String   @db.VarChar(50)
  targetId    String   @db.VarChar(100)
  oldValue    Json?
  newValue    Json?
  metadata    Json?
  ip          String?   @db.VarChar(45)
  userAgent   String?   @db.VarChar(500)
  createdAt   DateTime @default(now())

  @@index([actorId])
  @@index([action])
  @@index([targetType, targetId])
  @@index([createdAt])
}
```

---

### 4.11 System

#### ShareLink (for documents, etc.)
```prisma
model ShareLink {
  id          String           @id @default(uuid())
  resourceType ShareResourceType
  resourceId   String
  token        String           @unique
  permission   SharePermission  @default(READ)
  expiresAt    DateTime?
  maxViews     Int?
  viewCount    Int              @default(0)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@index([token])
  @@index([resourceType, resourceId])
  @@index([expiresAt])
}
```

#### UserConsent
```prisma
model UserConsent {
  id        String          @id @default(uuid())
  userId    String
  user      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  purpose   ConsentPurpose
  granted   Boolean         @default(false)
  version   String          @db.VarChar(20)
  grantedAt DateTime?
  revokedAt DateTime?
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  @@unique([userId, purpose])
  @@index([userId])
}
```

#### BackgroundJob
```prisma
model BackgroundJob {
  id          String      @id @default(uuid())
  queue       String      @db.VarChar(50)
  type        String      @db.VarChar(100)
  data        Json
  status      JobStatus   @default(QUEUED)
  attempts    Int         @default(0)
  maxAttempts Int         @default(3)
  error       String?     @db.Text
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([queue, status])
  @@index([status, createdAt])
  @@index([type])
}
```

#### OutboxEvent (for eventual consistency)
```prisma
model OutboxEvent {
  id        String       @id @default(uuid())
  aggregateType String   @db.VarChar(50)
  aggregateId String   @db.VarChar(100)
  type      String       @db.VarChar(100)
  data      Json
  status    OutboxStatus @default(PENDING)
  attempts  Int          @default(0)
  error     String?      @db.Text
  processedAt DateTime?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  @@index([status, createdAt])
  @@index([aggregateType, aggregateId])
}
```

#### IdempotencyRecord
```prisma
model IdempotencyRecord {
  id             String            @id @default(uuid())
  key            String            @unique
  operation      String            @db.VarChar(100)
  status         IdempotencyStatus @default(IN_PROGRESS)
  result         Json?
  completedAt    DateTime?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  @@index([key])
  @@index([operation])
  @@index([status, createdAt])
}
```

---

## 5. Relationships

### 5.1 Key Relationships Diagram

```
User
├── has many: Account (OAuth)
├── has many: Session
├── has one: UserProfile
├── has one: UserPreference
├── has one: UserPrivacySetting
├── has many: UserSkill
├── has many: UserEducation
├── has many: UserExperience
├── has many: UserSocialLink
├── has many: UserConsent
├── has many: UserNotification
├── has many: ActivityEvent
├── owns many: VaultFile
├── owns many: Document
├── owns many: Achievement
├── has one: RewardAccount
├── creates many: VerificationRequest (as requester)
├── verifies many: VerificationRequest (as verifier)
└── owns many: CredentialRecord (as subject)

Organization
├── has many: OrganizationMember
├── has many: OrganizationInvitation
├── owns many: VaultFile
├── owns many: Document
├── owns many: Achievement
├── has many: RewardRule
└── issues many: CredentialRecord

VaultFile
├── belongs to: User (owner)
├── belongs to: Organization (optional)
├── belongs to: VaultFolder (optional)
├── has many: VaultFileVersion
├── has many: FileAccessGrant
└── used in: AchievementEvidence, VerificationEvidence

Achievement
├── belongs to: User (owner)
├── belongs to: Organization (optional)
├── has many: AchievementEvidence
├── has many: AchievementSkill
├── has many: AchievementHistory
├── has many: VerificationRequest
└── has many: CredentialRecord

VerificationRequest
├── belongs to: User (requester)
├── belongs to: User (verifier, optional)
├── belongs to: Organization (optional)
├── belongs to: Achievement (optional)
├── has many: VerificationEvidence
└── has many: VerificationEvent

RewardAccount
├── belongs to: User
└── has many: RewardTransaction

RewardTransaction
├── belongs to: RewardAccount
└── belongs to: User
```

---

## 6. Indexes

All models have appropriate indexes for:
- Primary keys (automatic)
- Foreign keys (automatic in most cases)
- Unique constraints
- Frequently queried columns
- Sorting columns
- Filter columns

### 6.1 Notable Indexes

**User-related:**
- `User(slug)` - for public profiles
- `User(email)` - for login (unique)
- `User(status)` - for filtering active users

**Vault-related:**
- `VaultFile(ownerId, folderId)` - list files in folder
- `VaultFile(ownerId, deletedAt)` - list non-deleted files
- `VaultFile(status)` - filter by upload status
- `VaultFile(scanStatus)` - filter by scan status
- `VaultFile(storageKey)` - lookup by storage key

**Document-related:**
- `Document(ownerId, folderId)` - list documents in folder
- `Document(ownerId, deletedAt)` - list non-deleted documents
- `Document(ownerId, slug)` - unique slug per user

**Achievement-related:**
- `Achievement(ownerId, deletedAt)` - list non-deleted achievements
- `Achievement(ownerId, type)` - filter by type
- `Achievement(ownerId, status)` - filter by status

**Verification-related:**
- `VerificationRequest(requesterId, createdAt)` - list user's requests
- `VerificationRequest(verifierId)` - requests assigned to verifier
- `VerificationRequest(status, createdAt)` - filter by status

---

## 7. Constraints

### 7.1 Unique Constraints

- User.email
- User.slug
- Organization.slug
- Session.sessionToken
- Account.provider+providerAccountId
- Verification.token
- ShareLink.token
- FileAccessGrant.token
- RewardAccount.userId
- RewardTransaction.idempotencyKey
- UserSkill.userId+name
- UserEducation (no unique, can have multiple from same institution)
- UserConsent.userId+purpose

### 7.2 Foreign Key Constraints

All foreign keys have appropriate onDelete behavior:
- **Cascade:** Delete child when parent deleted (e.g., user's files, sessions)
- **SetNull:** Set to null when parent deleted (e.g., organization files)
- **NoAction:** Prevent deletion if children exist (default)

### 7.3 Check Constraints

Database-level checks are limited. Most validation is at the application level via Zod schemas.

---

## 8. Data Flow

### 8.1 User Creation
```
1. User submits registration form
2. Better Auth creates User record
3. Better Auth sends verification email
4. User clicks verification link
5. Better Auth marks email as verified
6. System creates default UserProfile
7. System creates default UserPreference
8. System creates default UserPrivacySetting
9. System creates RewardAccount
```

### 8.2 File Upload
```
1. User requests upload intent
2. System validates (quota, file type, size)
3. System creates VaultFile record (status: PENDING)
4. System generates pre-signed upload URL
5. Client uploads file to storage
6. Client notifies server of completion
7. System updates VaultFile (status: PROCESSING)
8. System triggers scan (status: PENDING -> CLEAN/MALWARE)
9. System updates StorageUsage
10. File becomes available (status: AVAILABLE) or quarantined
```

### 8.3 Verification Request
```
1. User submits achievement for verification
2. System creates VerificationRequest (status: PENDING)
3. System updates Achievement (status: VERIFICATION_PENDING)
4. Verifier reviews request
5. Verifier approves/rejects
6. System updates VerificationRequest (status: APPROVED/REJECTED)
7. If approved: System creates CredentialRecord
8. System updates Achievement (status: VERIFIED/REJECTED)
9. System notifies user
```

### 8.4 Reward Transaction
```
1. System identifies rewardable action
2. System checks RewardRule (active, cooldown, maxPerUser)
3. System checks idempotency key (no duplicates)
4. System starts transaction
5. System locks RewardAccount (optimistic concurrency)
6. System calculates new balance
7. System validates balance >= 0
8. System updates RewardAccount
9. System creates RewardTransaction
10. System commits transaction
```

---

## 9. Migrations

See [Migration Strategy](../MIGRATION_STRATEGY.md) for details on:
- Migration process
- Version control
- Rollback procedures
- Testing migrations

---

## 10. Seeding

### 10.1 Development Seed Data

The `prisma/seed.ts` file creates:
- Development admin user
- Sample users
- Sample organizations
- Sample files and folders
- Sample documents
- Sample achievements
- Sample reward rules

### 10.2 Production Considerations

- No production seeding (real data only)
- Seed only development environments
- Never seed production with fake verified credentials
- Sensitive data must be handled carefully

---

## 11. References

- [Prisma Schema](prisma/schema.prisma)
- [Migration Strategy](../MIGRATION_STRATEGY.md)
- [Backend Architecture](../ARCHITECTURE.md)
- [Authorization Model](../security/AUTHORIZATION_MODEL.md)
