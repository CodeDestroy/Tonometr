const { Prisma, PrismaClient } = require("@prisma/client");
const jwt = require('jsonwebtoken');
require('dotenv').config()
const secretAccess = process.env.SECRET_ACCESS
const secretRefresh = process.env.SECRET_REFRESH

//const tokenModel = require('../models/tokenModel')


class TokenService {
    

    //generate new tokens
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, secretAccess, {expiresIn: "30m"})
        const refreshToken = jwt.sign(payload, secretRefresh, {expiresIn: "30d"})

        return {
            accessToken,
            refreshToken,
        }
    }

    //check if access token is correct
    validateAccessToken (token) {
        try {
            const userData = jwt.verify(token, secretAccess);
            return userData
        }
        catch(e) {
            return null;
        }
    }


    //check if refresh token is ok
    async validateRefreshToken (token) {
        try {
            const userData = await jwt.verify(token, secretRefresh);
            return userData
        }
        catch(e) {
            return console.log(e);
        }
    }

    //save refresh token to DB
    async saveToken (userId, refreshToken) {
        let tokenData = await prisma.$queryRaw`SELECT * FROM public.users_db_tokens WHERE uirs_users_db_id = ${userId};`
        
        
        if (tokenData.length != 0) {
            //result.refreshtoken = refreshToken;
            await prisma.$queryRaw`UPDATE public.users_db_tokens SET refreshtoken = ${refreshToken} WHERE uirs_users_db_id = ${userId}`
        }
        else {
            await prisma.$queryRaw`INSERT INTO public.users_db_tokens (refreshtoken, uirs_users_db_id) VALUES( ${refreshToken}, ${userId} )`
        }
        tokenData = await prisma.$queryRaw`SELECT * FROM public.users_db_tokens WHERE uirs_users_db_id = ${userId}`
        return tokenData;
    }
 
    //remove token from DB
    async removeToken (refreshToken) {
        const tokenData = await prisma.$queryRaw`DELETE FROM public.users_db_tokens WHERE refreshtoken = ${refreshToken} RETURNING *;`
        //const tokenData = tokenModel.deleteOne(refreshToken);
        return tokenData;
    }

    //find token in DB
    async findToken (refreshToken) {
        const tokenData = await prisma.$queryRaw`SELECT * FROM public.users_db_tokens WHERE refreshtoken = ${refreshToken};`
        //const tokenData = tokenModel.findOne({refreshToken});
        return tokenData;
    }

}

module.exports = new TokenService();