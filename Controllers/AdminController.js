const { Prisma } = require("@prisma/client");
const { response } = require("express");
const testPDF = require('../filesHTML/test');
const pdf = require('html-pdf')
const path = require('path')
const fs = require('fs')

const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const MainService = require("../service/MainService");
const ApiError = require("../exeptions/api-error");
const adminService = require("../service/admin-service");


class MainController {
    
    async showAllUsers(req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const page = req.body.page;
            const count = req.body.count;
            const users = await adminService.showAllUsers(page, count)
            res.send(users)
        }
        catch (e) {
            console.log(e);
        }
    }

    async findUsers(req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const label = req.body.label;
            const choice = req.body.choice;
            const users = await adminService.findUsers(label, choice)
            res.send(users)
        }
        catch(e) {
            console.log(e)
        }
    }

    async getCountUsers (req, res) {
        try {
            const users = await prisma.uirs_users_db.findMany({})
            res.send(users)
        }
        catch(e) {
            console.log(e)
        }
    }
    
    



}
module.exports = new MainController();
