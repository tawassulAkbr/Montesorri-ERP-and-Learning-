-- CreateTable
CREATE TABLE "learning_questions" (
    "id" TEXT NOT NULL,
    "gradeClass" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "emoji" TEXT,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correctIndex" INTEGER NOT NULL,

    CONSTRAINT "learning_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_streaks" (
    "studentId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "perfectCount" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TEXT,

    CONSTRAINT "student_streaks_pkey" PRIMARY KEY ("studentId")
);

-- CreateTable
CREATE TABLE "learning_sessions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "correct" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "xpEarned" INTEGER NOT NULL,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "criterionType" TEXT NOT NULL,
    "criterionValue" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_badges" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_badges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learning_questions_gradeClass_idx" ON "learning_questions"("gradeClass");

-- CreateIndex
CREATE UNIQUE INDEX "learning_sessions_studentId_date_key" ON "learning_sessions"("studentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateIndex
CREATE UNIQUE INDEX "student_badges_studentId_badgeId_key" ON "student_badges"("studentId", "badgeId");
