-- Add optional Discord identity fields.
ALTER TABLE "User"
    ADD COLUMN "discordUsername" VARCHAR(32),
    ADD COLUMN "discordUserId" VARCHAR(20);

-- Add forum threads and posts.
CREATE TABLE "ForumThread" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "authorId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ForumThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ForumPost" (
    "id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "threadId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ForumThread_slug_key" ON "ForumThread"("slug");
CREATE INDEX "ForumThread_updatedAt_idx" ON "ForumThread"("updatedAt" DESC);
CREATE INDEX "ForumPost_threadId_createdAt_idx" ON "ForumPost"("threadId", "createdAt");

ALTER TABLE "ForumThread"
    ADD CONSTRAINT "ForumThread_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ForumPost"
    ADD CONSTRAINT "ForumPost_threadId_fkey"
    FOREIGN KEY ("threadId") REFERENCES "ForumThread"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "ForumPost_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
