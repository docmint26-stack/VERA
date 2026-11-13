-- Root-level folders must have unique names per owner.
-- Prisma's @@unique([ownerId, parentId, name]) cannot express a partial index
-- (PostgreSQL treats NULL parentId rows as distinct), so this is authored by
-- hand. Nested folder uniqueness is covered by the Prisma constraint.
CREATE UNIQUE INDEX "VaultFolder_ownerId_name_root_key"
  ON "VaultFolder"("ownerId", "name")
  WHERE "parentId" IS NULL;
