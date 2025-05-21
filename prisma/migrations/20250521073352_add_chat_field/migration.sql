/*
  Warnings:

  - Made the column `reason` on table `messagereport` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `communitymessage` ADD COLUMN `threadId` INTEGER NULL,
    ADD COLUMN `upvoteCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `messagereport` ADD COLUMN `details` TEXT NULL,
    ADD COLUMN `resolution` VARCHAR(191) NULL,
    ADD COLUMN `resolvedAt` DATETIME(3) NULL,
    MODIFY `reason` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `CommunityThread` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `userId` INTEGER NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `replyCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `CommunityThread_userId_idx`(`userId`),
    INDEX `CommunityThread_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MessageUpvote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `messageId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MessageUpvote_userId_idx`(`userId`),
    UNIQUE INDEX `MessageUpvote_messageId_userId_key`(`messageId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `CommunityMessage_threadId_idx` ON `CommunityMessage`(`threadId`);

-- CreateIndex
CREATE INDEX `MessageReport_status_idx` ON `MessageReport`(`status`);

-- AddForeignKey
ALTER TABLE `CommunityThread` ADD CONSTRAINT `CommunityThread_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityMessage` ADD CONSTRAINT `CommunityMessage_threadId_fkey` FOREIGN KEY (`threadId`) REFERENCES `CommunityThread`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageUpvote` ADD CONSTRAINT `MessageUpvote_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `CommunityMessage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageUpvote` ADD CONSTRAINT `MessageUpvote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
