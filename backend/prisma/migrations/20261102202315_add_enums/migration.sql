-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('like', 'comment', 'follow', 'mention');

-- AlterTable Notification (сохраняем данные)
ALTER TABLE "Notification" 
ALTER COLUMN "type" TYPE "NotificationType" 
USING "type"::text::"NotificationType";

-- AlterTable User (сохраняем данные)
ALTER TABLE "User" 
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "role" TYPE "Role" 
USING "role"::text::"Role",
ALTER COLUMN "role" SET DEFAULT 'user'::"Role";