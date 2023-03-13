const { Prisma } = require("@prisma/client");
const { response } = require("express");
const testPDF = require('../filesHTML/test');
const pdf = require('html-pdf')
const path = require('path')
const fs = require('fs')

const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const MainService = require("../service/MainService");

class MainController {
    
    async getResults(req, res) {
        try {
            const apointment = await prisma.apointment.findFirst({
                where: {
                    patient_id: 999,
                },
                orderBy: {
                  id: "desc"
                }
              })
            
           /*  const apointment = await prisma.apointment.findUnique({
                where: {
                    patient_id: 999,
                },
              }) */
            if (!req.body) return res.sendStatus(400);
            await global.prisma.monitoring_ton.create({
                data: {
                    is_del: null,
                    upper_pressure: parseInt(req.body.SYS),
                    lower_pressure: parseInt(req.body.DIA),
                    heart_rate: parseInt(req.body.PUL),
                    reaction: null,
                    measurement_comment: null,
                    apointment_id: apointment.id,
                }
            });
            res.send('Успешно')          
        }
        catch (e) {
            console.log(e);
        }
    }
    
    async testPrint (req, res) {
        if (!req.body) res.send(Promise.reject())
        const name = `template_kpi_1row.docx`
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
            ORG_NAME: "John",
            DATE_START: "Doe",
            DATE_END: "0652455478",
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

    async register (req, res) {
        if (!req.body) res.send(Promise.reject())
        const secondName = req.body.secondName;
        const firstName = req.body.firstName;
        const patronomicName = req.body.patronomicName;
        const phone = req.body.phone;
        const email = req.body.email;
        const snils = req.body.snils;
        const polis = req.body.polis;
        const birthDate = req.body.birthDate;
        const gender = parseInt(req.body.gender);
        const adress = req.body.adress;
        const district = parseInt(req.body.district);
        const newPatient = await MainService.addPatient(secondName, firstName, patronomicName, phone, email, snils, polis, birthDate, gender, adress, district)
        //console.log(newPatient);
        res.send(newPatient)
    }



}
module.exports = new MainController();
