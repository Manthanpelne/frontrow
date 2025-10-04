/*
  Warnings:

  - You are about to drop the column `price` on the `Showtime` table. All the data in the column will be lost.
  - The primary key for the `TicketSeat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ticketSeatId` on the `TicketSeat` table. All the data in the column will be lost.
  - Added the required column `showtimeId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seatId` to the `TicketSeat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Showtime" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "showtimeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TicketSeat" DROP CONSTRAINT "TicketSeat_pkey",
DROP COLUMN "ticketSeatId",
ADD COLUMN     "seatId" TEXT NOT NULL,
ADD CONSTRAINT "TicketSeat_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "SeatPrice" (
    "id" SERIAL NOT NULL,
    "seatType" TEXT NOT NULL,
    "price" MONEY NOT NULL,
    "showtimeId" INTEGER NOT NULL,

    CONSTRAINT "SeatPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeatPrice_showtimeId_seatType_key" ON "SeatPrice"("showtimeId", "seatType");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatPrice" ADD CONSTRAINT "SeatPrice_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;
