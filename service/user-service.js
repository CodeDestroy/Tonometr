const tokenService = require('./token-service')
const { Prisma, PrismaClient } = require("@prisma/client");
//const UserDto = require('../dtos/user-dto')
const bcrypt = require('bcryptjs')
const ApiError = require('../exeptions/api-error');
const UserDto = require('../dtos/user-dto')


class UserService {
    
    async registrationPatient (login, password, patient_id) {
        try {
            //find candidate            
            const candidate = await prisma.uirs_users_db.findMany({
                where: {
                    login: login,
                },
              })
              
            //if user already exists
            if (candidate.length > 0) {
                //send error
                throw ApiError.BadRequest(`Пользователь ${login} уже существует`)
            }

            //hash password
            const pass_to_hash = password.valueOf();
            const hashPassword = bcrypt.hashSync(pass_to_hash, 8);
            
            const uirs_users_db =  await prisma.uirs_users_db.create({
                data: {
                    login: login,
                    password: hashPassword
                },
            })
            const uirs_users = await prisma.uirs_users.create({
                data: {
                    role_id: 2,
                    uirs_users_db_id: uirs_users_db.id
                }
            })
            await prisma.uirs_users_db.update({
                where: {
                    id: uirs_users_db.id,
                },
                data: {
                    uirs_users_id: uirs_users.id,
                },
              })

            const uirs_users_patients_doctors = await prisma.uirs_users_patients_doctors.create({
                data: {
                    patient_id: patient_id,
                    uirs_users_id: uirs_users.id,
                }
            });
            await prisma.uirs_users.update({
                where: {
                    id: uirs_users.id,
                },
                data: {
                    uirs_users_patients_doctors_id: uirs_users_patients_doctors.id,
                },
              })

            //return userDto and tokens
            return { user: uirs_users_db }
        }
        catch (e) {
            console.log(e)
        }
    }
    //registration method
    async registration (login, password, Doctor_id, role) {
        try {
            //find candidate            
            const candidate = await prisma.uirs_users_db.findMany({
                where: {
                    login: login,
                },
              })
              
            //if user already exists
            if (candidate.length > 0) {
                //send error
                throw ApiError.BadRequest(`Пользователь ${login} уже существует`)
            }

            //hash password
            const pass_to_hash = password.valueOf();
            const hashPassword = bcrypt.hashSync(pass_to_hash, 8);
            
            const uirs_users_db =  await prisma.uirs_users_db.create({
                data: {
                    login: login,
                    password: hashPassword
                },
            })
            const uirs_users = await prisma.uirs_users.create({
                data: {
                    role_id: parseInt(role),
                    uirs_users_db_id: uirs_users_db.id
                }
            })
            await prisma.uirs_users_db.update({
                where: {
                    id: uirs_users_db.id,
                },
                data: {
                    uirs_users_id: uirs_users.id,
                },
              })
            let doctor;
            let uirs_users_patients_doctors;
            if (Doctor_id ) {
                doctor = await prisma.doctor.findUnique({
                    where: {
                        id: parseInt(Doctor_id)
                    }
                })
                uirs_users_patients_doctors = await prisma.uirs_users_patients_doctors.create({
                    data: {
                        uirs_users_id: uirs_users.id,
                        doctor_id: doctor.id
                    }
                })
            }
            else {
                uirs_users_patients_doctors = await prisma.uirs_users_patients_doctors.create({
                    data: {
                        uirs_users_id: uirs_users.id,
                    }
                })
            }
            await prisma.uirs_users.update({
                where: {
                    id: uirs_users.id,
                },
                data: {
                    uirs_users_patients_doctors_id: uirs_users_patients_doctors.id,
                },
              })
            const userDto = await UserDto.deserialize(uirs_users_db, uirs_users, uirs_users_patients_doctors, doctor)
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
            const uirs_users_db = await prisma.uirs_users_db.findFirst({
                where: {
                    login: nick,
                },
              })
            //if user doesnt exist
            if (!uirs_users_db) {
                return ApiError.BadRequest(`Пользователь ${nick} не найден`)
            }
            //check if passwor correct
            const isPassEquals = await bcrypt.compare(pass, uirs_users_db.password);
            //if not
            if (!isPassEquals) {
                return ApiError.BadRequest(`Пароль неверный`)
            }
            const uirs_users = await prisma.uirs_users.findUnique({
                where: {
                    id: parseInt(uirs_users_db.uirs_users_id),
                },  
              })  
            const uirs_users_patients_doctors = await prisma.uirs_users_patients_doctors.findFirst({
                where: {
                    uirs_users_id: uirs_users.id,
                }
            })
            let doctor;
            let patient;
            if (uirs_users_patients_doctors.doctor_id == null) {
                patient = await prisma.patient.findUnique({
                    where: {
                        id: uirs_users_patients_doctors.patient_id
                    }
                })
            }
            else {
                doctor = await prisma.doctor.findUnique({
                    where: {
                        id: uirs_users_patients_doctors.doctor_id 
                    }
                })
            }
            
            //const user = await User.findOne({User_nick: nick});
            
            
            let userDto;
            if (uirs_users_patients_doctors.doctor_id != null)
                userDto = await UserDto.deserialize(uirs_users_db, uirs_users, uirs_users_patients_doctors, doctor)
            else
                userDto = await UserDto.deserializePatient(uirs_users_db, uirs_users, uirs_users_patients_doctors, patient)
            //console.log(userDto)
            const tokens = await tokenService.generateTokens({...userDto});
            await tokenService.saveToken(userDto.id, tokens.refreshToken);
            //send answer (user and tokens)
            return { ...tokens, user: userDto }
        }
        catch (e) {
            console.log(e)
        }
    }
    
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
            const tokenFromDb = await tokenService.findToken(refreshToken);
            if (!userData || !tokenFromDb) {
                throw ApiError.UnauthorizedError();
            }
            const uirs_users_db = await prisma.uirs_users_db.findUnique({
                where: {
                    id: userData.id,
                },
              })
              
            const uirs_users = await prisma.uirs_users.findUnique({
                where: {
                    id: parseInt(uirs_users_db.uirs_users_id),
                },  
              })  
              
            const uirs_users_patients_doctors = await prisma.uirs_users_patients_doctors.findFirst({
                where: {
                    uirs_users_id: uirs_users.id,
                }
            })
            let doctor;
            let patient;
            if (uirs_users_patients_doctors.doctor_id == null) {
                patient = await prisma.patient.findUnique({
                    where: {
                        id: uirs_users_patients_doctors.patient_id
                    }
                })
            }
            else {
                doctor = await prisma.doctor.findUnique({
                    where: {
                        id: uirs_users_patients_doctors.doctor_id 
                    }
                })
            }
            let userDto;
            if (uirs_users_patients_doctors.doctor_id != null)
                userDto = await UserDto.deserialize(uirs_users_db, uirs_users, uirs_users_patients_doctors, doctor)
            else
                userDto = await UserDto.deserializePatient(uirs_users_db, uirs_users, uirs_users_patients_doctors, patient)
            /* const doctor = await prisma.doctor.findUnique({
                where: {
                    id: uirs_users_patients_doctors.doctor_id
                }
            }) */
            //const userDto = await UserDto.deserialize(uirs_users_db, uirs_users, uirs_users_patients_doctors, doctor)
            const tokens = await tokenService.generateTokens({...userDto});
            
            await tokenService.saveToken(userDto.id, tokens.refreshToken);
            //if all is ok - return user and new tokens
            return { ...tokens, user: userDto }
        }
        catch (e) {
            console.log(e)
        }
    }

    async getDoctorByUserId (user_id) {
        try {
            console.log(user_id)
            const response = await prisma.$queryRawUnsafe(`
            select d.*, mp.med_post_name as med_post, mp.parent_id as parent_med_post_id
            from appointment a 
            join doctor d on a.doctor_id = d.id
            left join med_post mp on d.med_post_id = mp.id 
            where a.patient_id = ${user_id}
            order by a.id desc 
            limit 1`)
            return response;
        }
        catch (e) {
            console.log(e)
        }
    }

}


module.exports = new UserService();