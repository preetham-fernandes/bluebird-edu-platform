-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastLogin` DATETIME(3) NULL,
    `timezone` VARCHAR(191) NULL DEFAULT 'UTC',
    `deviceType` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Aircraft` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Test` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `subjectId` INTEGER NOT NULL,
    `aircraftId` INTEGER NOT NULL,
    `content` JSON NOT NULL,
    `totalQuestions` INTEGER NOT NULL,
    `passingScore` DOUBLE NOT NULL,
    `timeLimit` INTEGER NOT NULL,
    `lastUpdated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedBy` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestAttempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `testId` INTEGER NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `testSnapshot` JSON NOT NULL,
    `score` DOUBLE NULL,
    `timeTaken` INTEGER NULL,
    `passFail` BOOLEAN NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'in_progress',
    `attemptNumber` INTEGER NOT NULL,
    `deviceType` VARCHAR(191) NULL,
    `browserInfo` VARCHAR(191) NULL,
    `ipLocation` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionResponse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testAttemptId` INTEGER NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `userAnswer` VARCHAR(191) NULL,
    `isCorrect` BOOLEAN NULL,
    `timeTaken` INTEGER NULL,
    `answeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sequenceNumber` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `aircraftId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `paymentId` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `purchaseDevice` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudyMaterialView` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `materialId` INTEGER NOT NULL,
    `viewedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `timeSpent` INTEGER NULL,
    `completionPercent` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminActivityLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adminId` INTEGER NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` INTEGER NOT NULL,
    `details` JSON NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestChangeLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `changedBy` INTEGER NOT NULL,
    `changeDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `changeType` VARCHAR(191) NOT NULL,
    `previousContent` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Test` ADD CONSTRAINT `Test_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Test` ADD CONSTRAINT `Test_aircraftId_fkey` FOREIGN KEY (`aircraftId`) REFERENCES `Aircraft`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestAttempt` ADD CONSTRAINT `TestAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestAttempt` ADD CONSTRAINT `TestAttempt_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionResponse` ADD CONSTRAINT `QuestionResponse_testAttemptId_fkey` FOREIGN KEY (`testAttemptId`) REFERENCES `TestAttempt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_aircraftId_fkey` FOREIGN KEY (`aircraftId`) REFERENCES `Aircraft`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudyMaterialView` ADD CONSTRAINT `StudyMaterialView_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
