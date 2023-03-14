const { Prisma, PrismaClient } = require("@prisma/client");
const { response } = require("express");
const jwt = require('jsonwebtoken');

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
            const User_name = req.body.User_name;
            const User_surname = req.body.User_surname;
            const User_patronomic = req.body.User_patronomic;
            const Doctor_id = req.body.Doctor_id;
            const userData = await userService.registration(login, password, User_name, User_surname, User_patronomic, Doctor_id);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.status(200).json(userData);
        }
        catch (e) {
            console.log(e);
        }
    }

    async login(req, res) {
        try {
            const User_nick = req.body.login;
            const User_pass = req.body.password;
            const userData = await userService.login(User_nick, User_pass);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.status(200).json(userData);

        }
        catch (e) {
            console.log(e);
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

}
module.exports = new AuthController();
