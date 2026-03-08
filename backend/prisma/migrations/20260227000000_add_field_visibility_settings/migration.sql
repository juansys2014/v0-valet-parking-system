-- AlterTable
ALTER TABLE `AppSettings` ADD COLUMN `showLicensePlate` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `showParkingSpot` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `showAttendantName` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `showMedia` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `showNotes` BOOLEAN NOT NULL DEFAULT true;
