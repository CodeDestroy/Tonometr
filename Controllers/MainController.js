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

class MainController {
    
    async getResults(req, res) {
        try {
            if (!req.body) res.send(Promise.reject())
            const sys = req.body.SYS;
            const dia = req.body.DIA;
            const pul = req.body.PUL;
            const device_id = req.body.deviceId;
            const patient_id = req.body.patient_id;

            const response = await MainService.addMeasure(sys, dia, pul, device_id, patient_id)
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
    
    async testPrint (req, res) {
        if (!req.body) res.send(Promise.reject())
        const name = `template_kpi_1row.docx`
        const sys = req.body.sys;
        const dia = req.body.dia;
        const pul = req.body.pul;
        console.log(sys, dia, pul)
        let pathToFile = '';
        pathToFile = path.join(__dirname, '..', '/DocxTemplates/' + name) 
        const content = fs.readFileSync(
            path.resolve(pathToFile),
            "binary"
        );

        const zip = new PizZip(content);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        doc.render({
            ORG_NAME: sys,
            DATE_START: dia,
            DATE_END: pul,
            KPI_NAME_1: "New Website",
            KPI_VALUE_1: "value 1"
        });

        const buf = doc.getZip().generate({
            type: "nodebuffer",
            // compression: DEFLATE adds a compression step.
            // For a 50MB output document, expect 500ms additional CPU time
            compression: "DEFLATE",
        });
        
        // buf is a nodejs Buffer, you can either write it to a
        // file or res.send it with express for example.
        const savedName = `${Date.now()}_template_kp1_1.docx`;
        const pathToSave = path.join(__dirname, '..' ,'/files/') 
        
        console.log(pathToSave)
        fs.writeFileSync(path.resolve(pathToSave, savedName), buf);
        res.send(savedName)
        /* const name = `${Date.now()}_result.pdf`
        pathToFile = path.join(__dirname, '..', '/files/' + name) 
        pdf.create(testPDF(req.body), {}).toFile(pathToFile, (err) => {
            if(err) {
                res.send(Promise.reject());
            }
            res.send(pathToFile);
        }); */
    }
    async fetchPDF(req, res) {
        if (!req.body) res.send(Promise.reject())
        res.download(path.join(__dirname, '..' ,'/files/', req.body.data))
    }

    /* async registrationPatient(req, res) {
        try {
            const login = req.body.login;
            const password = req.body.password;
            const patient_id = req.body.Doctor_id;
            const userData = await userService.registrationPatient(login, password, patient_id);
            //res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.status(200).json(userData);
        }
        catch (e) {
            console.log(e);
        }
    } */

    async register (req, res) {
        if (!req.body) res.send(Promise.reject())
        const login = req.body.login;
        const password = req.body.password;
        const surname = req.body.secondName;
        const name = req.body.firstName;
        const patronomic_name = req.body.patronomicName;
        const phone = req.body.phone;
        const email = req.body.email;
        const snils = req.body.snils;
        const polis = req.body.polis;
        const birth_date = req.body.birthDate;
        const gender = parseInt(req.body.gender);
        const address = req.body.adress;
        const district = parseInt(req.body.district);
        const newPatient = await MainService.addPatient(surname, name, patronomic_name, phone, email, snils, polis, birth_date, gender, address, district)
        const user = await userService.registrationPatient(login, password, newPatient.id)
        res.send({...newPatient, ...user})
    }

    async findPatient (req, res) {
        if (!req.body) res.send(Promise.reject()) 
        const label = req.body.label;
        const choice = req.body.choice;
        const patients = await MainService.findPatient(label, choice)
        res.send(patients)
    }

    async addTonometr (req, res) {
        try {
            if (!req.body) res.send(Promise.reject()) 
            const tonometr_id = req.body.tonometr_id
            const serialNum = req.body.serialNum
            const newTonometr = await MainService.addTonometr(tonometr_id, serialNum)
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
           // console.log(req.body)
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
           // console.log(req.body)
           //patient_id, doctor_id, device_id
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


    async getCountMeasuresByPatientId (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const patient_id = req.body.patient_id;
            const response = await prisma.$queryRaw`select count(a.id) from appointment a    
                                join monitoring_ton mt on a.id = mt.appointment_id 
                                where a.patient_id = ${patient_id} 
                                group by a.id`
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
}
module.exports = new MainController();
