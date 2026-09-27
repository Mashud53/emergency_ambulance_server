/*
  Warnings:

  - You are about to drop the `Emergency` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'FAILED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Emergency" DROP CONSTRAINT "Emergency_ambulanceId_fkey";

-- DropForeignKey
ALTER TABLE "Emergency" DROP CONSTRAINT "Emergency_callerId_fkey";

-- DropForeignKey
ALTER TABLE "Emergency" DROP CONSTRAINT "Emergency_patientId_fkey";

-- DropTable
DROP TABLE "Emergency";

-- CreateTable
CREATE TABLE "emergencys" (
    "id" TEXT NOT NULL,
    "callerId" TEXT NOT NULL,
    "patientId" TEXT,
    "emergencyType" "EmergencyType" NOT NULL,
    "severity" "EmergencySeverity" NOT NULL,
    "description" TEXT,
    "pickupAddress" TEXT,
    "destinationAddress" TEXT,
    "status" "EmergencyStatus" NOT NULL DEFAULT 'PENDING',
    "ambulanceId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergencys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "paymentGateway" TEXT NOT NULL DEFAULT 'bkash',
    "merchantInvoiceNumber" TEXT NOT NULL,
    "bkashPaymnetId" TEXT,
    "bkshTrxId" TEXT,
    "payerReferench" TEXT,
    "paidAt" TEXT,
    "gateWayResponse" JSONB,
    "emergencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_merchantInvoiceNumber_key" ON "payments"("merchantInvoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "payments_emergencyId_key" ON "payments"("emergencyId");

-- AddForeignKey
ALTER TABLE "emergencys" ADD CONSTRAINT "emergencys_callerId_fkey" FOREIGN KEY ("callerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergencys" ADD CONSTRAINT "emergencys_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergencys" ADD CONSTRAINT "emergencys_ambulanceId_fkey" FOREIGN KEY ("ambulanceId") REFERENCES "ambulances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_emergencyId_fkey" FOREIGN KEY ("emergencyId") REFERENCES "emergencys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
