-- AlterEnum
ALTER TYPE "NotificationKind" ADD VALUE 'ABSENCE';

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "videoUrl" TEXT,
ALTER COLUMN "youtubeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "teacher_attendance_records" ADD COLUMN     "checkInTime" TEXT;

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readByTeacher" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "dueAt" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "text" TEXT,
    "fileName" TEXT,
    "filePath" TEXT,
    "submittedAt" TEXT NOT NULL,
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "grade" INTEGER,
    "feedback" TEXT,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "senderRole" "Role" NOT NULL,
    "content" TEXT NOT NULL,
    "readByParent" BOOLEAN NOT NULL DEFAULT false,
    "readByTeacher" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feedbacks_teacherId_readByTeacher_idx" ON "feedbacks"("teacherId", "readByTeacher");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_assignmentId_studentId_key" ON "submissions"("assignmentId", "studentId");

-- CreateIndex
CREATE INDEX "messages_parentId_teacherId_createdAt_idx" ON "messages"("parentId", "teacherId", "createdAt");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
