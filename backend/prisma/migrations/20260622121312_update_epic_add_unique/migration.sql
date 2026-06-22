/*
  Warnings:

  - A unique constraint covering the columns `[project_id,epic_name]` on the table `Epic` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Epic_project_id_epic_name_key" ON "Epic"("project_id", "epic_name");
