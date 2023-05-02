const ApiError = require('../exeptions/api-error');
const Prisma = require("@prisma/client");
const bcrypt = require('bcryptjs');

class AdminService {
    //registration method
    async showAllUsers (page, count, selectedList) {
        try {
            let roles = [];
            selectedList.forEach(element => {
                roles.push(parseInt(element.id))
            });
            const countToSkip = (page - 1) * count;
            const users = await prisma.$queryRaw`
                select uud.id as uud_id, uud.login  as uud_login, uud."password" as uud_password, uud.token_id as uud_token_id, 
                uu.id as uu_id, uu.role_id as uu_role_id, uupd.id as uupd_id, uupd.patient_id as uupd_patient_id, uupd.doctor_id as uupd_doctor_id, 
                p.id as p_id, p.surname as p_surname, p."name" as p_name, p.patronomic_name as p_patronomic_name, p.birth_date as p_birth_date,
                p.phone as p_phone, p.email as p_email, p.snils , p.polis , p.full_name as p_full_name, p.gender_id as p_gender_id,
                p.sp_district_id as p_sp_district_id, p.address as p_address, p.doc_id as p_doc_id, d.id as d_id, d.tabel_num,
                d.surname as d_surname, d."name" as d_name, d.patronomic_name as d_patronomic_name, d.phone as d_phone, d.email as d_email,
                d.birth_date as d_birth_date, d.med_post_id, d.full_name as d_full_name, d.gender_id as d_gender_id, mp.*, mo.medical_org_name as mo_medical_org_name, role.role as role_name
                from uirs_users_db uud
                join uirs_users uu on uud.uirs_users_id = uu.id 
                join roles r on uu.role_id = r.id
                join uirs_users_patients_doctors uupd on uu.uirs_users_patients_doctors_id = uupd.id 
                left join patient p on uupd.patient_id = p.id 
                left join doctor d on d.id = uupd.doctor_id 
                left join med_post mp on d.med_post_id = mp.id
                left join medical_org mo on mp.medical_org_id = mo.id
                join roles role on uu.role_id = role.id
                where r.id in (${Prisma.join(roles)})
                order by uud.login 
                limit ${count} offset ${countToSkip}
            `;
            return users
        }
        catch (e) {
            console.log(e)
        }
    }

    async findUsers(label, choice) {
        try {
            let query = `select uud.id as uud_id, uud.login  as uud_login, uud."password" as uud_password, uud.token_id as uud_token_id, 
                            uu.id as uu_id, uu.role_id as uu_role_id, uupd.id as uupd_id, uupd.patient_id as uupd_patient_id, uupd.doctor_id as uupd_doctor_id, 
                            p.id as p_id, p.surname as p_surname, p."name" as p_name, p.patronomic_name as p_patronomic_name, p.birth_date as p_birth_date,
                            p.phone as p_phone, p.email as p_email, p.snils , p.polis , p.full_name as p_full_name, p.gender_id as p_gender_id,
                            p.sp_district_id as p_sp_district_id, p.address as p_address, p.doc_id as p_doc_id, d.id as d_id, d.tabel_num,
                            d.surname as d_surname, d."name" as d_name, d.patronomic_name as d_patronomic_name, d.phone as d_phone, d.email as d_email,
                            d.birth_date as d_birth_date, d.med_post_id, d.full_name as d_full_name, d.gender_id as d_gender_id, mp.*, mo.medical_org_name as mo_medical_org_name, role.role as role_name
                            from uirs_users_db uud
                            join uirs_users uu on uud.uirs_users_id = uu.id 
                            join uirs_users_patients_doctors uupd on uu.uirs_users_patients_doctors_id = uupd.id 
                            left join patient p on uupd.patient_id = p.id 
                            left join doctor d on d.id = uupd.doctor_id
                            left join med_post mp on d.med_post_id = mp.id
                            left join medical_org mo on mp.medical_org_id = mo.id
                            join roles role on uu.role_id = role.id `;
            let whereQuery;
            switch (choice) {
                case '0':
                    whereQuery=`WHERE p.full_name like '%${label}%' or d.full_name like '%${label}%'`
                    break;
                case '1':
                    whereQuery=`WHERE p.phone like '%${label}%' or d.phone like '%${label}%'`
                    break;
                case '2':
                    whereQuery=`WHERE p.email like '%${label}%' or d.email like '%${label}%'`
                    break;
                case '3':
                    whereQuery=`WHERE p.snils like '%${label}%'`
                    break;
                case '4':
                    whereQuery=`WHERE p.polis like '%${label}%'`
                    break;    
                default:
                    throw ApiError.BadRequest(`Нет параметров для поиска!`)
            }
            query += whereQuery + ` order by uud.login`;

            const users = await prisma.$queryRawUnsafe(query)
            return users
        }
        catch (e) {
            console.log(e)
        }
    }

    async saveChangesToPatient (user) {
        try {
            var date = new Date(user.birthDate);
            const updatedPatient = await prisma.patient.update({
                where: {
                    id: user.p_id,
                },
                data: {
                    surname: user.secondName,
                    name: user.firstName,
                    patronomic_name: user.patronomicName,
                    birth_date: date,
                    phone: ('+7 '+ user.phone),
                    email: user.email,
                    snils: user.snils,
                    polis: user.polis,
                    full_name: (user.secondName + ' ' + user.firstName + ' ' + user.patronomicName),
                    sp_district: {
                        connect: {id: parseInt(user.district)},
                    },
                    address: user.address
                },
              })
            if (user.newPass != null || user.newPass > 3) {
                const pass_to_hash = user.newPass.valueOf();
                const hashPassword = bcrypt.hashSync(pass_to_hash, 8);
                const patinets_doctors = await prisma.uirs_users_patients_doctors.findFirst({
                    where: {
                        patient_id: updatedPatient.id
                    }
                })
                const uirs_users = await prisma.uirs_users.findFirst({
                    where: {
                        uirs_users_patients_doctors_id: patinets_doctors.id
                    }
                })
                prisma.uirs_users_db.update({
                    where: {
                        id: uirs_users.uirs_users_db_id
                    },
                    data: {
                        password: hashPassword
                    }
                })
            }
            return updatedPatient;
        }
        catch (e) {
            console.log(e)
        }
    }

    async saveOrAddOrg (medOrgId, medOrgName, medOrgNameSmall, inn, region, parentOrgId) {
        try {
            var medOrg;
            if (medOrgId != 0) {
                medOrg = await prisma.$queryRaw`UPDATE medical_org 
                                    set medical_org_name = ${medOrgName},
                                    medical_org_name_small = ${medOrgNameSmall},
                                    region = ${region},
                                    inn = ${inn},
                                    parent_id = ${parentOrgId}
                                    where id = ${medOrgId}`
                /* medOrg = await prisma.medical_org.update({
                    where: {
                        id: medOrgId,
                    },
                    data: {
                        medical_org_name: medOrgName,
                        medical_org_name_small: medOrgNameSmall,
                        region: region,
                        inn: inn,
                        parent_id: parentOrgId,
                    },
                }) */
            }
            else {
                medOrg = await prisma.$queryRaw`INSERT into medical_org (medical_org_name, medical_org_name_small, region, inn, parent_id)
                                                VALUES (${medOrgName}, ${medOrgNameSmall}, ${region}, ${inn}, ${parentOrgId})`
                /* medOrg = await prisma.medical_org.create({
                    data: {
                        medical_org_name: medOrgName,
                        medical_org_name_small: medOrgNameSmall,
                        region: region,
                        inn: inn,
                        parent_id: parentOrgId,
                    },
                  }) */
            }
            return medOrg   
        }
        catch (e) {
            console.log(e)
        }
    }

    async saveOrAddPost (id, med_post_name, parent_id, medical_org_id) {
        try {
            var medPost;
            if (id != 0) {
                medPost = await prisma.$queryRaw`UPDATE med_post 
                                    set med_post_name = ${med_post_name},
                                    parent_id = ${parent_id},
                                    medical_org_id = ${medical_org_id}
                                    where id = ${id}`
            }
            else {
                medPost = await prisma.$queryRaw`INSERT into med_post (med_post_name, parent_id, medical_org_id)
                                                VALUES (${med_post_name}, ${parent_id}, ${medical_org_id})`
            }
            return medPost   
        }
        catch (e) {
            console.log(e)
        }
    }

    async saveOrAddDistrict (id, name) {
        try {
            var district;
            if (id != 0) {
                district = await prisma.$queryRaw`UPDATE sp_district 
                                    set name = ${name}
                                    where id = ${id}`
            }
            else {
                district = await prisma.$queryRaw`INSERT into sp_district (name)
                                                VALUES (${name})`
            }
            return district   
        }
        catch (e) {
            console.log(e)
        }
    }
    
    async saveChangesToUser (user) {
        try {
            
            var date = new Date(user.birthDate);
            
            const updatedUser = await prisma.doctor.update({
                where: {
                    id: user.doctor_id,
                },
                data: {
                    surname: user.secondName,
                    name: user.firstName,
                    patronomic_name: user.patronomicName,
                    birth_date: date,
                    phone: ('+7 '+ user.phone),
                    email: user.email,
                    full_name: (user.secondName + ' ' + user.firstName + ' ' + user.patronomicName),
                    med_post_id: parseInt(user.postId),
                    tabel_num: user.tabelNum
                },
              })
            const uupd = await prisma.uirs_users_patients_doctors.findFirst({
                where: {
                    doctor_id: updatedUser.id
                }
            })
            const uu = await prisma.uirs_users.updateMany({
                where: {
                    uirs_users_patients_doctors_id: uupd.id
                },
                data: {
                    role_id: parseInt(user.userRole)
                }
            })
            return {...updatedUser, ...uu};
        }
        catch (e) {
            console.log(e)
        }
    }

    async getDistricts () {
        try {
            const districts = await prisma.sp_district.findMany({})
            return districts
        }
        catch (e) {
            console.log(e)
        }
    }

}


module.exports = new AdminService();