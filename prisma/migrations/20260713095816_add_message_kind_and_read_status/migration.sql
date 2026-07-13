-- CreateEnum
CREATE TYPE "MessageKind" AS ENUM ('TEXT', 'VIEWING', 'ATTACHMENT');

-- AlterTable
ALTER TABLE "ConversationParticipant" ADD COLUMN     "lastReadAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "kind" "MessageKind" NOT NULL DEFAULT 'TEXT';
