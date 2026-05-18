/*
  Warnings:

  - A unique constraint covering the columns `[key,language]` on the table `EmailTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "EmailTemplate_key_key";

-- AlterTable
ALTER TABLE "EmailTemplate" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'pl';

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_key_language_key" ON "EmailTemplate"("key", "language");
