/*
  Warnings:

  - A unique constraint covering the columns `[project_id,sprint_name]` on the table `Sprint` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Sprint_project_id_sprint_name_key" ON "Sprint"("project_id", "sprint_name");
