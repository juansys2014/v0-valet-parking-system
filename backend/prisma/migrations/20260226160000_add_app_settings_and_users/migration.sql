-- CreateTable
CREATE TABLE `AppSettings` (
    `id` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL DEFAULT 'Valet Parking',
    `logo` LONGTEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppUser` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL DEFAULT '',
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `showCheckin` BOOLEAN NOT NULL DEFAULT true,
    `showCheckout` BOOLEAN NOT NULL DEFAULT true,
    `showVehicles` BOOLEAN NOT NULL DEFAULT true,
    `showAlerts` BOOLEAN NOT NULL DEFAULT true,
    `showHistory` BOOLEAN NOT NULL DEFAULT true,
    `accessToken` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert default AppSettings row
INSERT INTO `AppSettings` (`id`, `companyName`, `logo`, `updatedAt`) VALUES ('default', 'Valet Parking', NULL, NOW(3));
