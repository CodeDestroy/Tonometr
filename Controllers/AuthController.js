const { Prisma, PrismaClient } = require("@prisma/client");
const { response } = require("express");
const jwt = require('jsonwebtoken');
const ApiError = require("../exeptions/api-error");

const userService = require('../service/user-service');
//const bodyParser = require('body-parser');


const secret = process.env.SECRET_ACCESS



class AuthController {
    /* async index(req, res) {
        try {
            res.sendFile(__dirname + "/client/index.html"); 
        }
        catch (e) {
            console.log(e);
        }
    } */


    async registration(req, res) {
        try {
            const login = req.body.login;
            const password = req.body.password;
            const secondName = req.body.secondName;
            const firstName = req.body.firstName;
            const patronomicName = req.body.patronomicName;
            const phone = req.body.phone;
            const email = req.body.email;
            const birthDate = req.body.birthDate;
            const gender = req.body.gender
            const role_id = req.body.role_id;
            const postId = req.body.postId;
            const tabelNum = req.body.tabelNum;
            const docktor = await userService.addDoctor(secondName, firstName, patronomicName, tabelNum, phone, email, birthDate,  gender,  postId)
            const userData = await userService.registration(docktor.id, login, password, role_id);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.status(200).json(userData);
        }
        catch (e) {
            console.log(e);
        }
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

    async login(req, res) {
        try {
            const User_nick = req.body.login;
            const User_pass = req.body.password;
            const userData = await userService.login(User_nick, User_pass);
            if (userData.message != undefined)
                throw ApiError.BadRequest(userData.message)
                //console.log(userData)
            else {
                await res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
                return res.status(200).json(userData);
            }
        }
        catch (e) {
            //console.log(e);
            res.status(401).send(e.message)
        }
    }

    async logout (req, res) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.status(200).json(token);
        }
        catch (e) {
            console.log(e);
        }
    }

    async refresh (req, res) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            //console.log(userData)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.status(200).json(userData);
        }
        catch (e) {
            console.log(e);
        }
    }

    async getDoctorByUserId (req, res) {
        try {
            const user_id = req.body.user_id;
            const response = await userService.getDoctorByUserId(user_id)
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

}
module.exports = new AuthController();
