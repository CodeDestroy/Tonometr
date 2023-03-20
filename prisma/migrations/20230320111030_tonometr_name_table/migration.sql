-- AlterTable
ALTER TABLE "device" ADD COLUMN     "name" VARCHAR;

-- AlterTable
ALTER TABLE "monitoring_ton" ALTER COLUMN "dt_dimension" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "dt_dimension" SET DATA TYPE TIMESTAMP(6);

-- AddForeignKey
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_fk_1" FOREIGN KEY ("med_post_id") REFERENCES "med_post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
