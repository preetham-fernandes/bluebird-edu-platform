-- AlterTable
ALTER TABLE `user` ADD COLUMN `avatarChoice` VARCHAR(191) NULL,
    ADD COLUMN `communityTermsAccepted` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `CommunityMessage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `userId` INTEGER NOT NULL,
    `parentId` INTEGER NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CommunityMessage_userId_idx`(`userId`),
    INDEX `CommunityMessage_parentId_idx`(`parentId`),
    INDEX `CommunityMessage_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MessageReport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `messageId` INTEGER NOT NULL,
    `reporterId` INTEGER NOT NULL,
    `reason` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MessageReport_messageId_idx`(`messageId`),
    INDEX `MessageReport_reporterId_idx`(`reporterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CommunityMessage` ADD CONSTRAINT `CommunityMessage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityMessage` ADD CONSTRAINT `CommunityMessage_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `CommunityMessage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageReport` ADD CONSTRAINT `MessageReport_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `CommunityMessage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageReport` ADD CONSTRAINT `MessageReport_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
