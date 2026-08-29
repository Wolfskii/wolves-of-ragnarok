-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN');
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "Game" AS ENUM ('VALHEIM', 'MINECRAFT', 'TERRARIA', 'ARK', 'OTHER');
CREATE TYPE "ServerAdapter" AS ENUM ('GAMEDIG', 'MOCK');
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'AVATAR', 'NEWS_COVER', 'BACKGROUND');
CREATE TYPE "ActivityType" AS ENUM ('JOINED', 'PROFILE_UPDATED', 'NEWS_PUBLISHED', 'SERVER_JOINED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "displayName" VARCHAR(80),
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "bio" TEXT,
    "avatarMediaId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NewsPost" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "excerpt" VARCHAR(320),
    "body" TEXT NOT NULL,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "authorId" UUID NOT NULL,
    "coverMediaId" UUID,
    "seoTitle" VARCHAR(70),
    "seoDescription" VARCHAR(170),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NewsPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Page" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "body" TEXT NOT NULL,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "authorId" UUID NOT NULL,
    "seoTitle" VARCHAR(70),
    "seoDescription" VARCHAR(170),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Server" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "game" "Game" NOT NULL,
    "adapter" "ServerAdapter" NOT NULL DEFAULT 'GAMEDIG',
    "host" VARCHAR(253) NOT NULL,
    "gamePort" INTEGER NOT NULL,
    "queryPort" INTEGER,
    "description" TEXT,
    "addressVisible" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "queryTimeoutMs" INTEGER NOT NULL DEFAULT 3000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServerStatusSnapshot" (
    "id" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "online" BOOLEAN NOT NULL,
    "playerCount" INTEGER,
    "maxPlayers" INTEGER,
    "playerNames" JSONB,
    "pingMs" INTEGER,
    "worldName" VARCHAR(160),
    "version" VARCHAR(80),
    "errorCode" VARCHAR(50),
    "queriedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServerStatusSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServerMembership" (
    "userId" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServerMembership_pkey" PRIMARY KEY ("userId", "serverId")
);

CREATE TABLE "UserGame" (
    "userId" UUID NOT NULL,
    "game" "Game" NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserGame_pkey" PRIMARY KEY ("userId", "game")
);

CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteTitle" VARCHAR(100) NOT NULL DEFAULT 'Wolves of Ragnarok',
    "tagline" VARCHAR(180) NOT NULL DEFAULT 'Where Wolves Gather, Ragnarok Begins.',
    "heroHeading" VARCHAR(180) NOT NULL DEFAULT 'Stand with the pack',
    "heroBody" TEXT NOT NULL,
    "communityIntroduction" TEXT NOT NULL,
    "seoDescription" VARCHAR(170) NOT NULL,
    "featuredNewsId" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HomepageFeature" (
    "id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "body" VARCHAR(300) NOT NULL,
    "href" VARCHAR(500),
    "icon" VARCHAR(50),
    "imageMediaId" UUID,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "HomepageFeature_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunityLink" (
    "id" UUID NOT NULL,
    "label" VARCHAR(80) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "kind" VARCHAR(30) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CommunityLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Media" (
    "id" UUID NOT NULL,
    "kind" "MediaKind" NOT NULL DEFAULT 'IMAGE',
    "filename" VARCHAR(255) NOT NULL,
    "storagePath" VARCHAR(500) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" VARCHAR(300),
    "uploadedById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Activity" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "ActivityType" NOT NULL,
    "summary" VARCHAR(240) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");
CREATE INDEX "User_lastSeenAt_idx" ON "User"("lastSeenAt");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE UNIQUE INDEX "NewsPost_slug_key" ON "NewsPost"("slug");
CREATE INDEX "NewsPost_status_publishedAt_idx" ON "NewsPost"("status", "publishedAt" DESC);
CREATE INDEX "NewsPost_authorId_idx" ON "NewsPost"("authorId");
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");
CREATE INDEX "Page_status_publishedAt_idx" ON "Page"("status", "publishedAt" DESC);
CREATE INDEX "Server_enabled_displayOrder_idx" ON "Server"("enabled", "displayOrder");
CREATE UNIQUE INDEX "Server_host_gamePort_key" ON "Server"("host", "gamePort");
CREATE INDEX "ServerStatusSnapshot_serverId_queriedAt_idx" ON "ServerStatusSnapshot"("serverId", "queriedAt" DESC);
CREATE INDEX "UserGame_userId_displayOrder_idx" ON "UserGame"("userId", "displayOrder");
CREATE INDEX "HomepageFeature_enabled_displayOrder_idx" ON "HomepageFeature"("enabled", "displayOrder");
CREATE INDEX "CommunityLink_enabled_displayOrder_idx" ON "CommunityLink"("enabled", "displayOrder");
CREATE UNIQUE INDEX "Media_storagePath_key" ON "Media"("storagePath");
CREATE INDEX "Media_kind_createdAt_idx" ON "Media"("kind", "createdAt" DESC);
CREATE INDEX "Media_uploadedById_idx" ON "Media"("uploadedById");
CREATE INDEX "Activity_userId_createdAt_idx" ON "Activity"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarMediaId_fkey" FOREIGN KEY ("avatarMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NewsPost" ADD CONSTRAINT "NewsPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NewsPost" ADD CONSTRAINT "NewsPost_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Page" ADD CONSTRAINT "Page_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ServerStatusSnapshot" ADD CONSTRAINT "ServerStatusSnapshot_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServerMembership" ADD CONSTRAINT "ServerMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServerMembership" ADD CONSTRAINT "ServerMembership_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserGame" ADD CONSTRAINT "UserGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_featuredNewsId_fkey" FOREIGN KEY ("featuredNewsId") REFERENCES "NewsPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HomepageFeature" ADD CONSTRAINT "HomepageFeature_imageMediaId_fkey" FOREIGN KEY ("imageMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
