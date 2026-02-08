-- CreateTable
CREATE TABLE `Ticket` (
    `id` VARCHAR(191) NOT NULL,
    `ticketCode` VARCHAR(191) NULL,
    `licensePlate` VARCHAR(191) NOT NULL,
    `parkingSpot` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `checkinAttendantName` VARCHAR(191) NULL,
    `deliveryAttendantName` VARCHAR(191) NULL,
    `status` ENUM('parked', 'requested', 'ready', 'delivered') NOT NULL DEFAULT 'parked',
    `checkinTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `requestedTime` DATETIME(3) NULL,
    `readyTime` DATETIME(3) NULL,
    `deliveredTime` DATETIME(3) NULL,
    `checkoutTime` DATETIME(3) NULL,
    `wasRegistered` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Ticket_ticketCode_idx`(`ticketCode`),
    INDEX `Ticket_licensePlate_idx`(`licensePlate`),
    INDEX `Ticket_status_idx`(`status`),
    INDEX `Ticket_checkinTime_idx`(`checkinTime`),
    INDEX `Ticket_deliveredTime_idx`(`deliveredTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaItem` (
    `id` VARCHAR(191) NOT NULL,
    `ticketId` VARCHAR(191) NOT NULL,
    `type` ENUM('photo', 'video') NOT NULL,
    `url` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MediaItem_ticketId_idx`(`ticketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `ticketId` VARCHAR(191) NULL,
    `ticketCode` VARCHAR(191) NULL,
    `licensePlate` VARCHAR(191) NULL,
    `message` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_read_idx`(`read`),
    INDEX `Notification_timestamp_idx`(`timestamp`),
    INDEX `Notification_ticketCode_idx`(`ticketCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MediaItem` ADD CONSTRAINT `MediaItem_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
