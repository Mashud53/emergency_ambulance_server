/*
  Warnings:

  - Added the required column `emergencyType` to the `Emergency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `severity` to the `Emergency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Emergency` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmergencySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EmergencyStatus" AS ENUM ('PENDING', 'VERIFYING', 'DISPATCHING', 'AMBULANCE_ASSIGNED', 'AMBULANCE_ACCEPTED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'PATIENT_ONBOARD', 'EN_ROUTE_TO_HOSPITAL', 'ARRIVED_AT_HOSPITAL', 'PATIENT_ADMITTED', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "EmergencyType" AS ENUM ('ACCIDENT', 'HEART_ATTACK', 'STROKE', 'BREATHING_PROBLEM', 'UNCONSCIOUS', 'INJURY', 'PREGNANCY', 'FIRE', 'DROWNING', 'POISONING', 'OTHER');

-- AlterTable
ALTER TABLE "Emergency" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "ambulanceId" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "destinationAddress" TEXT,
ADD COLUMN     "emergencyType" "EmergencyType" NOT NULL,
ADD COLUMN     "pickupAddress" TEXT,
ADD COLUMN     "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "severity" "EmergencySeverity" NOT NULL,
ADD COLUMN     "status" "EmergencyStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Emergency" ADD CONSTRAINT "Emergency_ambulanceId_fkey" FOREIGN KEY ("ambulanceId") REFERENCES "ambulances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
