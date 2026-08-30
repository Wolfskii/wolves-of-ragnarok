-- Replace display names with optional Steam profile metadata.
ALTER TABLE "User" DROP COLUMN "displayName";
ALTER TABLE "User"
    ADD COLUMN "steamProfileUrl" VARCHAR(500),
    ADD COLUMN "steamUsername" VARCHAR(80),
    ADD COLUMN "steamAvatarUrl" VARCHAR(500);
