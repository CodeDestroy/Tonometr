const tokenService = require('./token-service')
const { Prisma, PrismaClient } = require("@prisma/client");
//const UserDto = require('../dtos/user-dto')
const bcrypt = require('bcryptjs')
const ApiError = require('../exeptions/api-error');
const UserDto = require('../dtos/user-dto')


class UserService {
    //registration method
    async registration (login, password, User_name, User_surname, User_patronomic, Doctor_id) {
        try {
            //find candidate
            
            const candidate = await prisma.uirs_users_db.findUnique({
                where: {
                    login: login,
                },
              })
              
            //if user already exists
            if (candidate) {
                //send error
                throw ApiError.BadRequest(`Пользователь ${login} уже существует`)
            }

            //hash password
            const pass_to_hash = password.valueOf();
            const hashPassword = bcrypt.hashSync(pass_to_hash, 8);
            
            /* const nick = User_nick; 
            const name = User_name;
            const surname = User_surname; */
            const small_name_io_famil = User_name.substring(0, 1) + ". " + User_patronomic.substring(0, 1) + ". " + User_surname
            const small_name =  User_surname + User_name.substring(0, 1) + ". " + User_patronomic.substring(0, 1) + ". "
            //console.log(await tokenService.)
            const user = await prisma.uirs_users.create({
                data: {
                    famil: User_surname,
                    name: User_name,
                    otch: User_patronomic,
                    small_name_io_famil: small_name_io_famil,
                    full_name: (User_surname + User_name + User_patronomic),
                    small_name: small_name,
                    small_name_rp: small_name,
                    small_name_dp: small_name,
                    doctor_id: BigInt(parseInt(Doctor_id))
                },  
              })

              
              const user_db = await prisma.uirs_users_db.create({
                data: {
                    login: login,
                    uirs_users_id: user.id,
                    is_admin: 1,
                    is_blocked: 0,
                    password: hashPassword
                },
              })

            const userDto = await UserDto.deserialize(user_db, user)
            const tokens = tokenService.generateTokens({...userDto});
            //save token to DB
            await tokenService.saveToken(userDto.id, tokens.refreshToken);
            
            //return userDto and tokens
            return { ...tokens, user: userDto }
        }
        catch (e) {
            console.log(e)
        }
    }

    //login
    async login(nick, pass) {
        try {
            //find user
            const user = await prisma.uirs_users_db.findUnique({
                where: {
                    login: nick,
                },
              })
              const user_full = await prisma.uirs_users.findUnique({
                where: {
                    id: user.uirs_users_id
                },  
              })  
            //const user = await User.findOne({User_nick: nick});
            //if user doesnt exist
            if (!user) {
                throw ApiError.BadRequest(`Пользователь ${nick} не найден`)
            }
            //check if passwor correct
            const isPassEquals = await bcrypt.compare(pass, user.password);
            //if not
            if (!isPassEquals) {
                throw ApiError.BadRequest(`Пароль неверный`)
            }
            const userDto = await UserDto.deserialize(user, user_full); //id, role
            const tokens = tokenService.generateTokens({...userDto});
            await tokenService.saveToken(userDto.id, tokens.refreshToken);
            //send answer (user and tokens)
            return { ...tokens, user: userDto }
        }
        catch (e) {
            console.log(e)
        }
    }

    /* async update (id, nick, name, surname) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw ApiError.BadRequest(`Пользователь ${nick} не найден`)
            }
            const result = await User.updateOne({_id: id}, { 
                User_nick: nick,
                User_name: name,
                User_surname: surname
            })
            return await User.findById(id);
        }
        catch (e) {
            console.log(e)
        }
    } */
    
    //logout
    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    //refresh auth
    async refresh(refreshToken) {
        try{
            if (!refreshToken){
                throw ApiError.UnauthorizedError();
            }
            const userData = await tokenService.validateRefreshToken(refreshToken);
            //const tokenFromDb = await prisma.$queryRaw`SELECT * WHERE refreshtoken = ${refreshToken}`
            /* const tokenFormDb = await prisma.tokens.findUnique({
                where: {
                    refreshtoken: refreshToken,
                },
              }) */
            const tokenFromDb = await tokenService.findToken(refreshToken);
    
            if (!userData || !tokenFromDb) {
                throw ApiError.UnauthorizedError();
            }
    
            const user = await prisma.uirs_users_db.findUnique({
                where: {
                    id: parseInt(userData.id),
                },
              })
              const user_full = await prisma.uirs_users.findUnique({
                where: {
                    id: user.uirs_users_id
                },  
              })  
            const userDto = await UserDto.deserialize(user, user_full)
            
            //const user = await User.findById(userData.id)
            //const userDto = new UserDto(user); //id, role
            const tokens = tokenService.generateTokens({...userDto});
            
            await tokenService.saveToken(user.id, tokens.refreshToken);
            //if all is ok - return user and new tokens
            return { ...tokens, user: userDto }
        }
        catch (e) {
            console.log(e)
        }
    }

    //get all users
    /* async getUsers() {
        const users = await User.find();
        return users;
    } */
}


module.exports = new UserService();