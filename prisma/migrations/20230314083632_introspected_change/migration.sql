-- CreateTable
CREATE TABLE "act" (
    "id" SERIAL NOT NULL,
    "type" INTEGER,
    "act_number" VARCHAR,
    "act_date" DATE,

    CONSTRAINT "act_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "act_type" (
    "id" SERIAL NOT NULL,
    "type_name" VARCHAR,

    CONSTRAINT "act_type_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "act_transfer_id" INTEGER,
    "act_return_id" INTEGER,
    "contact_id" INTEGER,
    "ap_date" DATE,
    "finished" VARCHAR,
    "sp_district_id" INTEGER,
    "device_id" INTEGER,
    "contract_id" INTEGER,

    CONSTRAINT "appointment_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract" (
    "id" SERIAL NOT NULL,
    "contract_number" VARCHAR,
    "contract_date" DATE,
    "is_del" VARCHAR,

    CONSTRAINT "contract_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device" (
    "id" SERIAL NOT NULL,
    "serial_number" VARCHAR,
    "model_id" INTEGER,

    CONSTRAINT "device_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor" (
    "id" SERIAL NOT NULL,
    "tabel_num" VARCHAR,
    "surname" VARCHAR,
    "name" VARCHAR,
    "patronomic_name" VARCHAR,
    "phone" VARCHAR,
    "email" VARCHAR,
    "birth_date" DATE,
    "med_post_id" INTEGER,
    "full_name" VARCHAR,
    "gender_id" INTEGER,

    CONSTRAINT "doctor_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gender" (
    "id" SERIAL NOT NULL,
    "gender_name" VARCHAR,

    CONSTRAINT "gender_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "med_post" (
    "id" SERIAL NOT NULL,
    "med_post_name" VARCHAR,
    "parent_id" INTEGER,
    "medical_org_id" INTEGER,

    CONSTRAINT "med_post_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_org" (
    "id" SERIAL NOT NULL,
    "medical_org_name" VARCHAR,
    "parent_id" INTEGER,
    "medical_org_name_small" VARCHAR,
    "region" VARCHAR,

    CONSTRAINT "medical_org_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_org_district" (
    "id" SERIAL NOT NULL,
    "medical_org_id" INTEGER,
    "sp_district_id" INTEGER,

    CONSTRAINT "medical_org_district_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkb10" (
    "id" SERIAL NOT NULL,
    "mkb_name" VARCHAR,

    CONSTRAINT "mkb10_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model" (
    "id" SERIAL NOT NULL,
    "model_name" VARCHAR,

    CONSTRAINT "model_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_ton" (
    "id" SERIAL NOT NULL,
    "dt_dimension" DATE,
    "upper_pressure" INTEGER,
    "lower_pressure" INTEGER,
    "heart_rate" INTEGER,
    "appointment_id" INTEGER NOT NULL,

    CONSTRAINT "monitoring_ton_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient" (
    "id" SERIAL NOT NULL,
    "surname" VARCHAR,
    "name" VARCHAR,
    "patronomic_name" VARCHAR,
    "birth_date" DATE,
    "phone" VARCHAR,
    "email" VARCHAR,
    "snils" VARCHAR,
    "polis" VARCHAR,
    "full_name" VARCHAR,
    "gender_id" INTEGER NOT NULL,
    "sp_district_id" INTEGER,
    "address" VARCHAR,
    "doc_id" INTEGER,

    CONSTRAINT "patient_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_anamnesis" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER,
    "mkb10_id" INTEGER,

    CONSTRAINT "patient_anamnesis_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_documents" (
    "id" SERIAL NOT NULL,
    "document_name" VARCHAR,
    "document_type_id" INTEGER,
    "document_number" VARCHAR,
    "document_date" DATE,
    "given_by" VARCHAR,
    "patient_id" INTEGER,
    "representative_surname" VARCHAR,
    "representative_name" VARCHAR,
    "representative_patronomic_name" VARCHAR,
    "representative_birthday" DATE,
    "representative_snils" VARCHAR,
    "representative_polis" VARCHAR,
    "representative_phone" VARCHAR,
    "representative_address_fact" VARCHAR,
    "representative_factor" INTEGER,

    CONSTRAINT "patient_documents_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "role" VARCHAR,

    CONSTRAINT "roles_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sp_district" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR,

    CONSTRAINT "sp_district_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uirs_users" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER,
    "uirs_users_db_id" INTEGER,
    "uirs_users_patients_doctors_id" INTEGER,

    CONSTRAINT "uirs_users_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uirs_users_db" (
    "id" SERIAL NOT NULL,
    "login" VARCHAR,
    "password" VARCHAR,
    "token_id" INTEGER,
    "uirs_users_id" INTEGER,

    CONSTRAINT "uirs_users_db_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uirs_users_db_tokens" (
    "id" SERIAL NOT NULL,
    "refreshtoken" VARCHAR,
    "userid" INTEGER,

    CONSTRAINT "uirs_users_db_tekens_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uirs_users_patients_doctors" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER,
    "doctor_id" INTEGER,
    "uirs_users_id" INTEGER,

    CONSTRAINT "uirs_users_patients_doctors_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "act_id_idx" ON "act"("id");

-- CreateIndex
CREATE UNIQUE INDEX "act_type_id_idx" ON "act_type"("id");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_id_idx" ON "appointment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "contract_id_idx" ON "contract"("id");

-- CreateIndex
CREATE UNIQUE INDEX "device_id_idx" ON "device"("id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_id_idx" ON "doctor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "gender_id_idx" ON "gender"("id");

-- CreateIndex
CREATE UNIQUE INDEX "med_post_id_idx" ON "med_post"("id");

-- CreateIndex
CREATE UNIQUE INDEX "medical_org_id_idx" ON "medical_org"("id");

-- CreateIndex
CREATE UNIQUE INDEX "medical_org_district_id_idx" ON "medical_org_district"("id");

-- CreateIndex
CREATE UNIQUE INDEX "mkb10_id_idx" ON "mkb10"("id");

-- CreateIndex
CREATE INDEX "model_id_idx" ON "model"("id");

-- CreateIndex
CREATE UNIQUE INDEX "monitoring_ton_id_idx" ON "monitoring_ton"("id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_id_idx" ON "patient"("id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_anamnesis_id_idx" ON "patient_anamnesis"("id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_documents_id_idx" ON "patient_documents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_id_idx" ON "roles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "sp_district_id_idx" ON "sp_district"("id");

-- CreateIndex
CREATE UNIQUE INDEX "uirs_users_id_idx" ON "uirs_users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "uirs_users_uirs_users_db_id_idx" ON "uirs_users"("uirs_users_db_id");

-- CreateIndex
CREATE UNIQUE INDEX "uirs_users_db_id_idx" ON "uirs_users_db"("id");

-- CreateIndex
CREATE UNIQUE INDEX "uirs_users_db_tekens_id_idx" ON "uirs_users_db_tokens"("id");

-- CreateIndex
CREATE UNIQUE INDEX "uirs_users_db_tokens_refreshtoken_idx" ON "uirs_users_db_tokens"("refreshtoken");

-- CreateIndex
CREATE UNIQUE INDEX "uirs_users_db_tokens_userid_idx" ON "uirs_users_db_tokens"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "uirs_users_patients_doctors_id_idx" ON "uirs_users_patients_doctors"("id");

-- AddForeignKey
ALTER TABLE "act" ADD CONSTRAINT "act_fk" FOREIGN KEY ("type") REFERENCES "act_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_act_return_fk" FOREIGN KEY ("act_return_id") REFERENCES "act"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_act_transfer_fk" FOREIGN KEY ("act_transfer_id") REFERENCES "act"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_contract_fk" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_doctor_fk" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_fk" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_patient_fk" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_fk" FOREIGN KEY ("model_id") REFERENCES "model"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_fk" FOREIGN KEY ("gender_id") REFERENCES "gender"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "med_post" ADD CONSTRAINT "med_post_fk" FOREIGN KEY ("medical_org_id") REFERENCES "medical_org"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "med_post" ADD CONSTRAINT "med_post_fk_1" FOREIGN KEY ("parent_id") REFERENCES "med_post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "medical_org" ADD CONSTRAINT "medical_org_fk" FOREIGN KEY ("parent_id") REFERENCES "medical_org"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "medical_org_district" ADD CONSTRAINT "medical_org_district_fk" FOREIGN KEY ("medical_org_id") REFERENCES "medical_org"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "medical_org_district" ADD CONSTRAINT "medical_org_district_fk_1" FOREIGN KEY ("sp_district_id") REFERENCES "sp_district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "monitoring_ton" ADD CONSTRAINT "monitoring_ton_fk" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_district_fk" FOREIGN KEY ("sp_district_id") REFERENCES "sp_district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_fk" FOREIGN KEY ("doc_id") REFERENCES "patient_documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_gender_fk" FOREIGN KEY ("gender_id") REFERENCES "gender"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_anamnesis" ADD CONSTRAINT "patient_anamnesis_fk" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_anamnesis" ADD CONSTRAINT "patient_anamnesis_fk_1" FOREIGN KEY ("mkb10_id") REFERENCES "mkb10"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_fk" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "uirs_users" ADD CONSTRAINT "uirs_users_fk" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "uirs_users" ADD CONSTRAINT "uirs_users_fk_1" FOREIGN KEY ("uirs_users_db_id") REFERENCES "uirs_users_db"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "uirs_users" ADD CONSTRAINT "uirs_users_fk_2" FOREIGN KEY ("uirs_users_patients_doctors_id") REFERENCES "uirs_users_patients_doctors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "uirs_users_db" ADD CONSTRAINT "uirs_users_db_fk" FOREIGN KEY ("token_id") REFERENCES "uirs_users_db_tokens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "uirs_users_db" ADD CONSTRAINT "uirs_users_db_fk_1" FOREIGN KEY ("uirs_users_id") REFERENCES "uirs_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "uirs_users_db_tokens" ADD CONSTRAINT "uirs_users_db_tokens_fk" FOREIGN KEY ("userid") REFERENCES "uirs_users_db"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "uirs_users_patients_doctors" ADD CONSTRAINT "uirs_users_patients_doctors_fk" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "uirs_users_patients_doctors" ADD CONSTRAINT "uirs_users_patients_doctors_fk_1" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "uirs_users_patients_doctors" ADD CONSTRAINT "uirs_users_patients_doctors_fk_2" FOREIGN KEY ("uirs_users_id") REFERENCES "uirs_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
