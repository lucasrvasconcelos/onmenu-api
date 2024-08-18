/*
  Warnings:

  - Added the required column `groupSearchDescription` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `group` ADD COLUMN `groupSearchDescription` VARCHAR(191) NOT NULL;
