-- AlterTable
ALTER TABLE `communitythread` ADD COLUMN `upvoteCount` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `ThreadUpvote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `threadId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ThreadUpvote_userId_idx`(`userId`),
    UNIQUE INDEX `ThreadUpvote_threadId_userId_key`(`threadId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ThreadUpvote` ADD CONSTRAINT `ThreadUpvote_threadId_fkey` FOREIGN KEY (`threadId`) REFERENCES `CommunityThread`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ThreadUpvote` ADD CONSTRAINT `ThreadUpvote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
