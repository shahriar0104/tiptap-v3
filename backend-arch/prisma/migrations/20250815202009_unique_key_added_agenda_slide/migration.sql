/*
  Warnings:

  - A unique constraint covering the columns `[boardMeetingId,order]` on the table `AgendaGroup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[agendaGroupId,order]` on the table `AgendaItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[presentationId,orderIndex]` on the table `Slide` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AgendaGroup_boardMeetingId_order_key" ON "AgendaGroup"("boardMeetingId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "AgendaItem_agendaGroupId_order_key" ON "AgendaItem"("agendaGroupId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Slide_presentationId_orderIndex_key" ON "Slide"("presentationId", "orderIndex");
