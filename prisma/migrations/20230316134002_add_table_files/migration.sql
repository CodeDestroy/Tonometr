/*
  Warnings:

  - You are about to drop the column `contact_id` on the `appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "act" ADD COLUMN     "file_id" INTEGER;

-- AlterTable
ALTER TABLE "appointment" DROP COLUMN "contact_id";

-- AlterTable
ALTER TABLE "contract" ADD COLUMN     "file_id" INTEGER;

-- CreateTable
CREATE TABLE "files" (
    "id" SERIAL NOT NULL,
    "file_name" VARCHAR NOT NULL,
    "path" VARCHAR NOT NULL,

    CONSTRAINT "files_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "files_id_idx" ON "files"("id");

-- AddForeignKey
ALTER TABLE "act" ADD CONSTRAINT "act_fk_1" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_fk" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
