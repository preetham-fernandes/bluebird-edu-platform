-- AlterTable
ALTER TABLE `communitymessage` ADD COLUMN `isThread` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `moduleId` INTEGER NULL,
    ADD COLUMN `subjectId` INTEGER NULL,
    ADD COLUMN `title` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `CommunityMessage_moduleId_idx` ON `CommunityMessage`(`moduleId`);

-- CreateIndex
CREATE INDEX `CommunityMessage_subjectId_idx` ON `CommunityMessage`(`subjectId`);

-- CreateIndex
CREATE INDEX `CommunityMessage_isThread_idx` ON `CommunityMessage`(`isThread`);
