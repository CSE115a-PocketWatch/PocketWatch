
-- CreateTable
CREATE TABLE "StudentPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyStudyLimitMinutes" INTEGER NOT NULL DEFAULT 240,
    "sessionLengthMinutes" INTEGER NOT NULL DEFAULT 60,
    "availableDays" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[],
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '21:00',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentPreferences_userId_key"
ON "StudentPreferences"("userId");

-- AddForeignKey
ALTER TABLE "StudentPreferences"
ADD CONSTRAINT "StudentPreferences_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

