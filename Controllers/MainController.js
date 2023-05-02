const { Prisma } = require("@prisma/client");
const { response } = require("express");
const testPDF = require('../filesHTML/test');
const pdf = require('html-pdf')
const path = require('path')
const fs = require('fs')
const ApiError = require('../exeptions/api-error')
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const MainService = require("../service/MainService");

const userService = require("../service/user-service");
const { parse } = require("path");

class MainController {
    
    async getResults(req, res) {
        try {
            if (!req.body) res.send(Promise.reject())
            const sys = req.body.SYS;
            const dia = req.body.DIA;
            const pul = req.body.PUL;
            const device_id = req.body.deviceId;
            const patient_id = req.body.patient_id;
            const deviceName = req.body.deviceName
            const response = await MainService.addMeasure(sys, dia, pul, device_id, patient_id, deviceName)
            if (response.message != undefined) {
                throw ApiError.BadRequest(response.message)
            }
            else
                res.send(response)
        }
        catch (e) {
            res.status(404).send(e.message)
        }
    }
    
    async createContract (req, res) {
        if (!req.body) res.send(Promise.reject())
        const name = `template_contract_and_1_act.docx`
        const patient_id = req.body.patient_id;
        const doctor_id = req.body.doctor_id;
        const serial_number = req.body.serial_number
        const appointment_id = req.body.appointment_id
        const patient = await prisma.patient.findUnique({
            where: {
                id: patient_id
            }
        })
        const doctor = await prisma.doctor.findUnique({
            where: {
                id: doctor_id
            }
        })
        const med_post = await prisma.med_post.findUnique({
            where: {
                id: doctor.med_post_id
            }
        })
        const med_org = await prisma.medical_org.findUnique({
            where: {
                id: med_post.medical_org_id
            }
        })
        const device = await prisma.device.findFirst({
            where: {
                serial_number: serial_number,
            }
        })
        const model = await prisma.model.findUnique({
            where: {
                id: device.model_id
            }
        })
        const document = await prisma.patient_documents.findFirst({
            where: {
                patient_id: patient.id
            }
        })

        let pathToFile = '';
        pathToFile = path.join(__dirname, '..', '/DocxTemplates/' + name) 
        const content = fs.readFileSync(
            path.resolve(pathToFile),
            "binary"
        );
        let dateSTR = JSON.stringify(patient.birth_date)
        dateSTR = dateSTR.substring(0, dateSTR.indexOf('T'))
        dateSTR = dateSTR.replace('"', '')
        var parts = dateSTR.split('-');
        var newDate = parts[2] + '.' + parts[1] + '.' + parts[0]

        const dateDoc = new Date();
        var formatter = new Intl.DateTimeFormat("ru");
        const newDatePatientDoc = formatter.format(dateDoc);


        var docTemplate = ` ${document.document_type_id == 14 ? 'паспорт' : ''} ${document.document_seies} ${document.document_number} выдан ${newDatePatientDoc} ${document.given_by}; `

        const patient_info = patient.full_name + ' телефон ' + patient.phone + '; ' + docTemplate + ' СНИЛС ' + patient.snils + ';  Страховой полис ОМС ' + patient.polis + ';  Дата рождения: ' +
                             newDate + '; Место проживания: ' + patient.address; 


        const device_info = model.model_name + ' серийный номер ' + device.serial_number;

        const zip = new PizZip(content);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });


        const date = new Date();
        const date_doc = formatter.format(date);

        doc.render({
            DATE_DOC: date_doc,
            MEDICAL_ORG: med_org.medical_org_name,
            PATIENT_INFO: patient_info,
            DEVICE_INFO: device_info,
            PATIENT_ADDRES: patient.address,
            PATIENT_NAME: patient.full_name,
            SIGN_DATE_DOC: date_doc,
            DATE_DOC: date_doc,
            ACT_TR_DATE_DOC: date_doc,
            TRUE_PATIENT_NAME: patient.full_name,
            TRUE_PATIENT_BDATE: newDate,
            TRUE_PATIENT_ADDRES: patient.address,
        });

        const buf = doc.getZip().generate({
            type: "nodebuffer",
            // compression: DEFLATE adds a compression step.
            // For a 50MB output document, expect 500ms additional CPU time
            compression: "DEFLATE",
        });
        
        // buf is a nodejs Buffer, you can either write it to a
        // file or res.send it with express for example.
        const savedName = `${Date.now()}_${name}`;
        const pathToSave = path.join(__dirname, '..' ,'/files/') 
        

        const files = await prisma.files.create({
            data: {
                file_name: savedName,
                path: pathToSave
            }
        })
        const contract = await prisma.contract.create({
            data: {
                contract_date: new Date(),
                file_id: files.id
            }
        })


        await prisma.appointment.update({
            where: {
                id: appointment_id,
            },
            data: {
                contract_id: contract.id,
            },
          })

        fs.writeFileSync(path.resolve(pathToSave, savedName), buf);
        res.send(savedName)
    }

    async createReturnAct (req, res) {
        if (!req.body) res.send(Promise.reject())
        const name = `template_returning_act.docx`
        const appointment_id = req.body.appointment_id

        const appointment = await prisma.appointment.findUnique({
            where: {
                id: appointment_id
            }
        })

        const contractFinded = await prisma.contract.findUnique({
            where: {
                id: appointment.contract_id
            }   
        })

        const patient = await prisma.patient.findUnique({
            where: {
                id: appointment.patient_id
            }
        })
        const doctor = await prisma.doctor.findUnique({
            where: {
                id: appointment.doctor_id
            }
        })
        const med_post = await prisma.med_post.findUnique({
            where: {
                id: doctor.med_post_id
            }
        })
        const med_org = await prisma.medical_org.findUnique({
            where: {
                id: med_post.medical_org_id
            }
        })
        
        let dateSTR = JSON.stringify(patient.birth_date)
        dateSTR = dateSTR.substring(0, dateSTR.indexOf('T'))
        dateSTR = dateSTR.replace('"', '')
        var parts =dateSTR.split('-');
        var newDate = parts[2] + '.' + parts[1] + '.' + parts[0]

        let dateDoc = JSON.stringify(contractFinded.contract_date)
        dateDoc = dateDoc.substring(0, dateDoc.indexOf('T'))
        dateDoc = dateDoc.replace('"', '')
        var partsDoc = dateDoc.split('-');
        var newDateDoc = partsDoc[2] + '.' + partsDoc[1] + '.' + partsDoc[0]

        let pathToFile = '';
        pathToFile = path.join(__dirname, '..', '/DocxTemplates/' + name) 
        const content = fs.readFileSync(
            path.resolve(pathToFile),
            "binary"
        );
        const patient_info = patient.full_name + ' телефон ' + patient.phone + ' ПАСПОРТ!!!; СНИЛС ' + patient.snils + ';  Страховой полис ОМС ' + patient.polis + ';  Дата рождения: ' + 
                             newDate + '; Место проживания: ' + patient.address; 

        const zip = new PizZip(content);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });


        const date = new Date();
        var formatter = new Intl.DateTimeFormat("ru");
        const date_doc = formatter.format(date);

        doc.render({
            NUM_DOC: contractFinded.contract_number,
            DATE_DOC: newDateDoc,
            MEDICAL_ORG: med_org.medical_org_name,
            PATIENT_INFO: patient_info,
            PATIENT_NAME: patient.full_name,
            SIGN_DATE_DOC: date_doc,
        });

        const buf = doc.getZip().generate({
            type: "nodebuffer",
            // compression: DEFLATE adds a compression step.
            // For a 50MB output document, expect 500ms additional CPU time
            compression: "DEFLATE",
        });
        
        // buf is a nodejs Buffer, you can either write it to a
        // file or res.send it with express for example.
        const savedName = `${Date.now()}_${name}`;
        const pathToSave = path.join(__dirname, '..' ,'/files/') 
        

        const files = await prisma.files.create({
            data: {
                file_name: savedName,
                path: pathToSave
            }
        })
        const act = await prisma.act.create({
            data: {
                type: 1,
                act_date: new Date(),
                file_id: files.id
            }
        })

        await prisma.appointment.update({
            where: {
                id: appointment_id,
            },
            data: {
                act_return_id: act.id,
            },
          })

        fs.writeFileSync(path.resolve(pathToSave, savedName), buf);
        res.send(savedName)
    }

    


    async fetchPDF(req, res) {
        if (!req.body) res.send(Promise.reject())
        res.download(path.join(__dirname, '..' ,'/files/', req.body.data))
    }


    async getContractFileName (req, res) {
        try {
            if (!req.body) res.send(Promise.reject())
            const patient_id = req.body.patient_id;
            const appointment = await prisma.$queryRaw`select *
                                                        from appointment a
                                                        where patient_id = ${patient_id}
                                                        order by a.id desc
                                                        limit 1`
    
            const contract = await prisma.contract.findUnique({
                where: {
                    id: appointment[0].contract_id
                }
            })
            const files = await prisma.files.findUnique({
                where: {
                    id: contract.file_id
                }
            })
            res.send(files.file_name)
        }
        catch (e) {
            console.log(e)
        }
        
    }

    async getContractFileNameByApID(req, res) {
        try {
            if (!req.body) res.send(Promise.reject())
            const appointment_id = req.body.appointment_id;
    
            const appointment = await prisma.appointment.findUnique({
                where: {
                    id: appointment_id
                }
            })

            const contract = await prisma.contract.findUnique({
                where: {
                    id: appointment.contract_id
                }
            })
            const files = await prisma.files.findUnique({
                where: {
                    id: contract.file_id
                }
            })
            res.send(files.file_name)
        }
        catch (e) {
            console.log(e)
        }
    }
    
    async getReturnActFileNameByApID(req, res) {
        try {
            if (!req.body) res.send(Promise.reject())
            const appointment_id = req.body.appointment_id;
    
            const appointment = await prisma.appointment.findUnique({
                where: {
                    id: appointment_id
                }
            })


            const return_act = await prisma.act.findUnique({
                where: {
                    id: appointment.act_return_id
                }
            })
            const files = await prisma.files.findUnique({
                where: {
                    id: return_act.file_id
                }
            })
            res.send(files.file_name)
        }
        catch (e) {
            console.log(e)
        }
    }

    async register (req, res) {
        try {
            if (!req.body) res.send(Promise.reject())
            /* const login = req.body.login; */
            const password = req.body.password;
           /*  const surname = req.body.secondName;
            const name = req.body.firstName;
            const patronomic_name = req.body.patronomicName; */
            const phone = req.body.phone;
            const email = req.body.email;
            const snils = req.body.snils;
            const polis = req.body.polis;
            /* const birth_date = req.body.birthDate;
            const gender = parseInt(req.body.gender);
            const address = req.body.adress; */
            //phone, email, snils, polis,  district, password
            const district = parseInt(req.body.district);
            const newPatient = await MainService.addPatient( phone, email, snils, polis, district)
            if (newPatient.message != undefined) {
                    
                throw ApiError.BadRequest(newPatient.message)
            }
            else {
                const user = await userService.registrationPatient( snils, password, newPatient.id )
                if (newPatient.message != undefined) {
                    
                    throw ApiError.BadRequest(newPatient.message)
                }
                const user1 = await prisma.$queryRaw`select uud.id as uud_id, uud.login  as uud_login, uud."password" as uud_password, uud.token_id as uud_token_id, 
                                    uu.id as uu_id, uu.role_id as uu_role_id, uupd.id as uupd_id, uupd.patient_id as uupd_patient_id, uupd.doctor_id as uupd_doctor_id, 
                                    p.id as p_id, p.surname as p_surname, p."name" as p_name, p.patronomic_name as p_patronomic_name, p.birth_date as p_birth_date,
                                    p.phone as p_phone, p.email as p_email, p.snils , p.polis , p.full_name as p_full_name, p.gender_id as p_gender_id,
                                    p.sp_district_id as p_sp_district_id, p.address as p_address, p.doc_id as p_doc_id, d.id as d_id, d.tabel_num,
                                    d.surname as d_surname, d."name" as d_name, d.patronomic_name as d_patronomic_name, d.phone as d_phone, d.email as d_email,
                                    d.birth_date as d_birth_date, d.med_post_id, d.full_name as d_full_name, d.gender_id as d_gender_id
                                    from uirs_users_db uud
                                    join uirs_users uu on uud.uirs_users_id = uu.id 
                                    join uirs_users_patients_doctors uupd on uu.uirs_users_patients_doctors_id = uupd.id 
                                    left join patient p on uupd.patient_id = p.id 
                                    left join doctor d on d.id = uupd.doctor_id\n 
                                    where p.id = ${newPatient.id}`
                res.send({...user1[0]})
            }
        }
        catch (e) {
            res.status(404).send(e.message)
        }
    }

    async findPatient (req, res) {
        try {
            if (!req.body) res.send(Promise.reject()) 
            const label = req.body.label;
            const choice = req.body.choice;
            const patients = await MainService.findPatient(label, choice)
            res.send(patients)
        }
        catch (e) {
            console.log(e)
        }
        
    }
    async findPatientAppointments (req, res) {
        try {
            if (!req.body) res.send(Promise.reject()) 
            const label = req.body.label;
            const choice = req.body.choice;
            const patients = await MainService.findPatientAppointments(label, choice)
            res.send(patients)
        }
        catch (e) {
            console.log(e)
        }
        
    }

    async getPatientStatistic (req, res) {
        try {
            const statistic = await MainService.getPatientStatistic()
            res.send(statistic)
        }
        catch (e) {
            console.log(e)
        }
        
    }

    async findPatinetByChoiceAndDoctorId (req, res) {
        try {
            if (!req.body) res.send(Promise.reject()) 
            const label = req.body.label;
            const choice = req.body.choice;
            const doctor_id = req.body.doctor_id
            const patients = await MainService.findPatinetByChoiceAndDoctorId(label, choice, doctor_id)
            res.send(patients)
        }
        catch (e) {
            console.log(e)
        }
    }

    async addTonometr (req, res) {
        try {
            if (!req.body) res.send(Promise.reject()) 
            const tonometr_id = req.body.tonometr_id
            const serialNum = req.body.serialNum
            const deviceName = req.body.deviceName
            const newTonometr = await MainService.addTonometr(tonometr_id, serialNum, deviceName)
            if (newTonometr.message != undefined) {
                
                throw ApiError.BadRequest(newTonometr.message)
            }
            else {
                res.send(newTonometr)
            }
             //OSew0AtyYDMf/DmjmUM64A== OSew0AtyYDMf/DmjmUM64A== OSew0AtyYDMf/DmjmUM64A==
                
        }
        catch (e) {
            res.status(401).send(e.message)
        }
        
    }

    async findTonometrByBtId (req, res) {
        try {
            if (!req.body) res.send(Promise.reject()) 
            const tonometr_bt_id = req.body.bt_id;
            const response = await MainService.findTonometrByBtId(tonometr_bt_id)
            
            if (response.message != undefined) {
                throw ApiError.BadRequest(response.message)
            }
            else
                res.send(response)
        }
        catch (e) {
            res.status(404).send(e.message)
        }
            
    }

    async addAppointment(req, res) {
        try {
            if (!req.body) res.send(Promise.reject()) 
            const patient_id = req.body.patient_id;
            const doctor_id = req.body.doctor_id;
            const device_id = req.body.device_id;
            const response = await MainService.addAppointment(patient_id, doctor_id, device_id)
            if (response.message != undefined) {
                throw ApiError.BadRequest(response.message)
            }
            else
                res.send(response)
        }
        catch (e) {
            res.status(401).send(e.message)
        }
    }
    async closeAppointment(req, res) {
        try {
            if (!req.body) res.send(Promise.reject()) 
            const appointment_id = req.body.appointment_id;
            const response = await MainService.closeAppointment(appointment_id)
            if (response.message != undefined) {
                throw ApiError.BadRequest(response.message)
            }
            else
                res.send(response)
        }
        catch (e) {
            res.status(401).send(e.message)
        }
    }
    

    async getAllMeasuresByPatientId(req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const patient_id = req.body.patient_id;
            const page = req.body.currentPage;
            const order = req.body.order;
            const response = await MainService.getAllMeasuresByPatientId(patient_id, page, order);
            if (response.message != undefined) {
                throw ApiError.BadRequest(response.message)
            }
            else {
                res.send(response)
            }      
        }
        catch (e) {
            console.log(e)
            res.status(401).send(e.message)
        }
    }
    async getMeasuresByManyPatients(req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const ids = req.body.ids;
            const response = await prisma.$queryRaw`select *
                                                    from appointment a 
                                                    join monitoring_ton mt on a.id = mt.appointment_id 
                                                    join patient p on p.id = a.patient_id
                                                    where p.id in (${Prisma.join(ids)})`
            /* const page = req.body.currentPage;
            const order = req.body.order;
            const response = await MainService.getAllMeasuresByPatientId(patient_id, page, order); */
            if (response.message != undefined) {
                throw ApiError.BadRequest(response.message)
            }
            else {
                res.send(response)
            }      
        }
        catch (e) {
            console.log(e)
            res.status(401).send(e.message)
        }
    }
    


    async getCountMeasuresByPatientId (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const patient_id = req.body.patient_id;
            const response = await prisma.$queryRaw`select count(mt.id) from appointment a    
                                join monitoring_ton mt on a.id = mt.appointment_id 
                                where a.patient_id = ${patient_id} `
            if (response.message != undefined) {
                throw ApiError.BadRequest(response.message)
            }
            else {
                for (let i = 0; i < response.length; i++){
                    response[i].count = parseInt(response[i].count)
                }
                //response[0].count = parseInt(response[0].count)
                res.send(response)
            }
            
        }
        catch (e) {
            res.status(401).send(e.message)
        }
    }

    async getCountMeasuresByDoctorId (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const doctor_id = req.body.doctor_id;
            const response = await prisma.$queryRaw`select count(*)
                                    from monitoring_ton mt 
                                    join appointment a on mt.appointment_id = a.id
                                    where a.patient_id in (select p.id 
                                                        from patient p 
                                                        join appointment a2 on a2.patient_id = p.id
                                                        join doctor d on a2.doctor_id = d.id
                                                        where d.id = ${doctor_id})`
            if (response.message != undefined) {
                throw ApiError.BadRequest(response.message)
            }
            else {
                response[0].count = parseInt(response[0].count)
                res.send(response)
            }
        }
        catch (e) {
            res.status(401).send(e.message)
        }
    }

    async getCountMeasuresByMO (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const med_post_id = req.body.med_post_id;
            const response = await prisma.$queryRaw`select count(*)
                        from med_post mp
                        join medical_org mo on mp.medical_org_id = mo.id
                        join doctor d on d.med_post_id = mp.id 
                        join appointment a on d.id = a.doctor_id
                        join monitoring_ton mt on mt.appointment_id = a.id
                        where mo.id in (select mo2.id
                                        from med_post mp2 
                                        join medical_org mo2 on mp2.medical_org_id  = mo2.id 
                                        where mp2.id  = ${med_post_id})`
            if (response.message != undefined) {
                throw ApiError.BadRequest(response.message)
            }
            else {
                response[0].count = parseInt(response[0].count)
                res.send(response)
            }
        }
        catch (e) {
            res.status(401).send(e.message)
        }
    }

    

    async getCountPatientsByDoctorId (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const doctor_id = req.body.doctor_id;
            const response = await prisma.$queryRaw`select count(p.id) from patient p    
                                        join appointment a on a.patient_id = p.id 
                                        where a.doctor_id = ${doctor_id}` 
                                        //group by p.id`
            if (response.message != undefined) {
                throw ApiError.BadRequest(response.message)
            }
            else {
                for (let i = 0; i < response.length; i++) {
                    response[i].count = parseInt(response[i].count)
                }
                response[0].count = parseInt(response[0].count)
                res.send(response)
            }
        }
        catch (e) {
            res.status(401).send(e.message)
        }
    }

    async getCountPatientsByMO (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const med_post_id = req.body.med_post_id;
            const response = await prisma.$queryRaw`select  count(p.*)
            from med_post mp
            join medical_org mo on mp.medical_org_id = mo.id
            join doctor d on d.med_post_id = mp.id 
            join appointment a on d.id = a.doctor_id
            join patient p on a.patient_id = p.id 
            where mo.id in (select mo2.id
                            from med_post mp2 
                            join medical_org mo2 on mp2.medical_org_id  = mo2.id 
                            where mp2.id  = ${med_post_id})` 
                                        //group by p.id`
            if (response.message != undefined) {
                throw ApiError.BadRequest(response.message)
            }
            else {
                for (let i = 0; i < response.length; i++) {
                    response[i].count = parseInt(response[i].count)
                }
                response[0].count = parseInt(response[0].count)
                res.send(response)
            }
        }
        catch (e) {
            res.status(401).send(e.message)
        }
    }

    

    async getDistricts(req, res) {
        try {
            const response = await prisma.sp_district.findMany({})
            if (response.message != undefined) {
                throw ApiError.BadRequest(response.message)
            }
            else {
                res.send(response)
            }
        }
        catch (e) {
            res.status(401).send(e.message)
        }
    }

    async getPatientsByDoctorId (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const doctor_id = req.body.doctor_id;
            const page = req.body.currentPage;
            const order = req.body.order;
            const response = await MainService.getPatientsByDoctorId(doctor_id, page, order)
            /* const response = await prisma.$queryRaw`select p.* from appointment a    
                                join patient p on a.patient_id = p.id 
                                where a.doctor_id = ${doctor_id} 
                                group by p.id` */
            if (response.message != undefined) {
                throw ApiError.BadRequest(response.message)
            }
            else {
                response[0].count = parseInt(response[0].count)
                res.send(response)
            }
        }
        catch (e) {
            res.status(401).send(e.message)
        }
    }

    
    async getPatientsByMO (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const med_post_id = req.body.med_post_id;
            const page = req.body.currentPage;
            const order = req.body.order;
            const response = await MainService.getPatientsByMO(med_post_id, page, order)
            /* const response = await prisma.$queryRaw`select p.* from appointment a    
                                join patient p on a.patient_id = p.id 
                                where a.doctor_id = ${doctor_id} 
                                group by p.id` */
            if (response.message != undefined) {
                throw ApiError.BadRequest(response.message)
            }
            else {
                response[0].count = parseInt(response[0].count)
                res.send(response)
            }
        }
        catch (e) {
            res.status(401).send(e.message)
        }
    }

    async getMesuaresByDoctorId (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const doctor_id = req.body.doctor_id;
            const page = req.body.currentPage;
            const order = req.body.order;
            const response = await MainService.getMesuaresByDoctorId(doctor_id, page, order);
            /* const response = await prisma.$queryRaw`select p.*, a.*, mt.*
                from doctor d 
                join appointment a on a.doctor_id = d.id 
                join patient p on p.id = a.patient_id
                join monitoring_ton mt on mt.appointment_id = a.id 
                where d.id = ${doctor_id}` */
            res.send(response)
        }
        catch (e) {
            console.log(e)
        }
    }
    async getMesuaresByMO (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const med_post_id = req.body.med_post_id;
            const page = req.body.currentPage;
            const order = req.body.order;
            const response = await MainService.getMesuaresByMO(med_post_id, page, order);
            /* const response = await prisma.$queryRaw`select p.*, a.*, mt.*
                from doctor d 
                join appointment a on a.doctor_id = d.id 
                join patient p on p.id = a.patient_id
                join monitoring_ton mt on mt.appointment_id = a.id 
                where d.id = ${doctor_id}` */
            res.send(response)
        }
        catch (e) {
            console.log(e)
        }
    }
    

    async getAllMeasuresByPatientIdWithDataFormat (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const patient_id = req.body.patient_id;
            const dateStart = req.body.dateStart;
            const dateEnd = req.body.dateEnd;
            const response = await MainService.getAllMeasuresByPatientIdWithDataFormat(patient_id, dateStart, dateEnd)
            res.send(response)
        }
        catch (e) {
            console.log(e)
        }
    }

    async getMedOrg (req, res) {
        try {
            const str = '%' + req.body.str + '%'
            const organisations = await prisma.$queryRaw`
                select *
                from medical_org mo
                where mo.medical_org_name like ${str}`
            res.send(organisations)
        }
        catch (e) {
            console.log(e)
        }
    }

    async getMedPostById (req, res) {
        try {
            const id = req.body.id
            if (id) {
                const medPost = await prisma.med_post.findUnique({
                    where: {
                        id: id
                    }
                })
                res.send(medPost)
            }
            else {
                res.send(null)
            }
        }
        catch (e) {
            console.log(e)
        }
    }
    
    async getMedOrgById (req, res) {
        try {
            const id = req.body.id
            if (id) {
                const organisations = await prisma.medical_org.findUnique({
                    where: {
                        id: id
                    }
                })
                res.send(organisations)
            }
            else {
                res.send(null)
            }
        }
        catch (e) {
            console.log(e)
        }
    }
    async getPostByOrgId (req, res) {
        try {
            const str = '%' + req.body.str + '%'
            const orgId = req.body.orgId;
            const posts = await prisma.$queryRaw`
                select *
                from med_post mp
                where mp.medical_org_id = ${orgId} AND mp.med_post_name like ${str}`
            res.send(posts)
        }
        catch (e) {
            console.log(e)
        }
    }

    async getRoles (req, res) {
        try {
            const response = await prisma.roles.findMany({})
            res.send(response)
        }
        catch (e) {
            console.log(e)
        }
    }

    
    async getAvailableRoles (req, res) {
        try {
            const user_role = parseInt(req.body.user_role);
            let response;
            switch (user_role) {
                case 1:
                case 2:
                    response = await prisma.$queryRaw`
                            select *
                            from roles
                            where roles.id = 2`
                    break;

                default:
                    case 1:
                    response = await prisma.$queryRaw`
                            select *
                            from roles
                            where roles.id <= ${user_role}`
                    break;
            }
            
            /* const response = await prisma.roles.findMany({
                where: {
                    id: >= user_role
                }
            }) */
            res.send(response)
        }
        catch (e) {
            console.log(e)
        }
    }
    
    async getMKB (req, res) {
        try { 
            const label = '%' + req.body.label + '%';
            const response = await prisma.$queryRaw`select mkb.mkb_name as label, mkb.id 
                                                from mkb10 mkb 
                                                where mkb.mkb_name like ${label}`
            console.log(response)
            res.send(response)
        }
        catch (e) {
            console.log(e)
        }
    }

    async setChangesToPatient (req, res) {
        try {
            const patient_id = req.body.patient_id;
            const mkb10 = req.body.mkb10;
            const patient = await prisma.patient.findUnique({
                where: {
                    id: parseInt(patient_id)
                }
            })
            const newMkb = []
            mkb10.forEach(element => {
                const el = {
                    patient_id: patient_id,
                    mkb10_id: element.id
                }
                newMkb.push(el)
            });
            const anamnesis = await prisma.patient_anamnesis.createMany({
                data: newMkb,
                skipDuplicates: true,
            })
            res.send(anamnesis)
        }
        catch (e) {
            console.log(e)
        }
    }

    async getAnamnesisByPatinetId (req, res) {
        try {
            const patient_id = req.body.patient_id;
            const anamnesis = await prisma.$queryRaw`select mk.mkb_name as label, mk.id 
                                            from patient_anamnesis pa
                                            join mkb10 mk on mk.id = pa.mkb10_id
                                            where pa.patient_id = ${patient_id}`
            /* const newMkb = []
            mkb10.forEach(element => {
                const el = {
                    patient_id: patient_id,
                    mkb10_id: element.id
                }
                newMkb.push(el)
            });
            const anamnesis = await prisma.patient_anamnesis.createMany({
                data: newMkb,
                skipDuplicates: true,
            }) */
            res.send(anamnesis)
        }
        catch (e) {
            console.log(e)
        }
    }

    async getPatientsById (req, res) {
        try {
            const patient_id = req.body.patient_id;
            const patient = await prisma.patient.findUnique({
                where: {
                    id: patient_id
                }
            })
            res.send(patient)
        }
        catch (e) {
            console.log(e)
        }
    }

    async getDoctorById (req, res) {
        try {
            const doctor_id = req.body.doctor_id;
            const doctor = await prisma.$queryRaw`select *
            from doctor d 
            join med_post mp on d.med_post_id = mp.id 
            join medical_org mo on mp.medical_org_id  = mo.id 
            where d.id = ${doctor_id}`
        
            res.send(doctor)
        }
        catch (e) {
            console.log(e)
        }
    }

    async getDirByDoctorId (req, res) {
        try {
            const doctor_id = req.body.doctor_id;
            res.send(null)
        }
        catch(e) {
            console.log(e);
        }
    }
    
}
module.exports = new MainController();
