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
            const selectedList = req.body.selectedList
            const users = await adminService.showAllUsers(page, count, selectedList)
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
            console.log(label, choice)
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

    async getCountMedOrgs (req, res) {
        try {
            const medOrgs = await prisma.medical_org.findMany({})
            res.send(medOrgs)
        }
        catch(e) {
            console.log(e)
        }
    }

    async saveChangesToPatient (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const user = req.body.user;
            /* console.log(req.body) */
            /* console.log(user) */
            const response = await adminService.saveChangesToPatient(user)
            res.send(response)
        }
        catch (e) {
            console.log(e)
        }
    }

    async saveOrAddOrg (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const medOrgId = parseInt(req.body.medOrgId);
            const medOrgName = req.body.medOrgName;
            const medOrgNameSmall = req.body.medOrgNameSmall;
            const inn = req.body.inn;
            const region = req.body.region;
            const parentOrgId = parseInt(req.body.parentOrgId);
            /* console.log(req.body) */
            /* console.log(user) */
            const response = await adminService.saveOrAddOrg(medOrgId, medOrgName, medOrgNameSmall, inn, region, parentOrgId)
            res.send(response)
        }
        catch (e) {
            console.log(e)
        }
    }

    async saveOrAddPost (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const id = parseInt(req.body.id);
            const med_post_name = req.body.med_post_name;
            const parent_id = parseInt(req.body.parent_id);
            const medical_org_id = parseInt(req.body.medical_org_id);
            /* console.log(req.body) */
            /* console.log(user) */
            const response = await adminService.saveOrAddPost(id, med_post_name, parent_id, medical_org_id)
            res.send(response)
        }
        catch (e) {
            console.log(e)
        }
    }

    async saveOrAddDistrict (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const id = parseInt(req.body.id);
            const name = req.body.name;
            const response = await adminService.saveOrAddDistrict(id, name)
            res.send(response)
        }
        catch (e) {
            console.log(e)
        }
    }
    
    async getMedPostsWithMO (req, res) {
        try {
            const posts = await prisma.$queryRaw`select mp.*, mo.id as mo_id, mo.medical_org_name as mo_medical_org_name, mo.medical_org_name_small as mo_medical_org_name_small from 
                                                 med_post mp
                                                 join medical_org mo on mp.medical_org_id = mo.id`
            res.send(posts)
        }
        catch (e) {
            console.log(e)
        }
    }
    
    
    async saveChangesToUser (req, res) {
        try {
            if (!req.body) res.send(Promise.reject());
            const user = req.body.user;
            /* console.log(req.body) */
            /* console.log(user) */
            const response = await adminService.saveChangesToUser(user)
            res.send(response)
        }
        catch (e) {
            console.log(e)
        }
    }

    async getDistricts (req, res) {
        try {
            const response = await adminService.getDistricts()
            res.send(response)
        }
        catch (e) {
            console.log(e)
        }
    }
    

    
}
module.exports = new MainController();
