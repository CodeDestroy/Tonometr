-- AlterTable
ALTER TABLE "doctor" ADD COLUMN     "rir_id" VARCHAR,
ADD COLUMN     "rir_snils" VARCHAR;

-- AlterTable
ALTER TABLE "medical_org" ADD COLUMN     "inn" VARCHAR;

-- AlterTable
ALTER TABLE "patient" ADD COLUMN     "rir_id" VARCHAR;

-- AlterTable
ALTER TABLE "patient_documents" ADD COLUMN     "document_seies" VARCHAR;
