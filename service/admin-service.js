const ApiError = require('../exeptions/api-error');

class AdminService {
    //registration method
    async showAllUsers (page, count) {
        try {
            const countToSkip = (page - 1) * count;
            const users = await prisma.$queryRaw`
                select uud.id as uud_id, uud.login  as uud_login, uud."password" as uud_password, uud.token_id as uud_token_id, 
                uu.id as uu_id, uu.role_id as uu_role_id, uupd.id as uupd_id, uupd.patient_id as uupd_patient_id, uupd.doctor_id as uupd_doctor_id, 
                p.id as p_id, p.surname as p_surname, p."name" as p_name, p.patronomic_name as p_patronomic_name, p.birth_date as p_birth_date,
                p.phone as p_phone, p.email as p_email, p.snils , p.polis , p.full_name as p_full_name, p.gender_id as p_gender_id,
                p.sp_district_id as p_sp_district_id, p.address as p_address, p.doc_id as p_doc_id, d.id as d_id, d.tabel_num,
                d.surname as d_surname, d."name" as d_name, d.patronomic_name as d_patronomic_name, d.phone as d_phone, d.email as d_email,
                d.birth_date as d_birth_date, d.med_post_id, d.full_name as d_full_name, d.gender_id as d_gender_id
                from uirs_users_db uud
                join uirs_users uu on uud.uirs_users_id = uu.id 
                join uirs_users_patients_doctors uupd on uu.uirs_users_patients_doctors_id = uupd.id 
                left join patient p on uupd.patient_id = p.id 
                left join doctor d on d.id = uupd.doctor_id 
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
                            d.birth_date as d_birth_date, d.med_post_id, d.full_name as d_full_name, d.gender_id as d_gender_id
                            from uirs_users_db uud
                            join uirs_users uu on uud.uirs_users_id = uu.id 
                            join uirs_users_patients_doctors uupd on uu.uirs_users_patients_doctors_id = uupd.id 
                            left join patient p on uupd.patient_id = p.id 
                            left join doctor d on d.id = uupd.doctor_id\n `;
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
                default:
                    throw ApiError.BadRequest(`Нет параметров для поиска!`)
            }
            query += whereQuery + `\norder by uud.login`;

            const users = await prisma.$queryRawUnsafe(query)
            return users
        }
        catch (e) {

        }
    }

}


module.exports = new AdminService();