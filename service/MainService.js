const ApiError = require('../exeptions/api-error');
const RirService = require('./rir-service')


class MainService {
    //registration method
    async addPatient (phone, email, snils, polis, district) {
        try {
            //find candidate
            
            const candidate = await prisma.patient.findMany({
                where: {
                    snils: snils,
                },
              })
            //if user already exists
            if (candidate.length > 0) {
                //send error
                return ApiError.BadRequest(`Пользователь со СНИЛС ${snils} уже был зарегестрирован, пожалуйста, обратитесь к системному администратору`)
            }

            

            //hash password
            /* const pass_to_hash = password.valueOf();
            const hashPassword = bcrypt.hashSync(pass_to_hash, 8); */
            
            /* const nick = User_nick; 
            const name = User_name;
            const surname = User_surname; */
            let patientFormRir = await RirService.getPatientByPolis(polis)
            if (patientFormRir.data.length == 0) {
                //send error
                return ApiError.BadRequest(`Сначала зарегестрируйтесь в Квазар.РИР`)
            }
            patientFormRir = await RirService.getPatientById(patientFormRir.data[0].id)
            if (patientFormRir.data.snils != snils.replace(/-| /g, '')) {
                //send error
                return ApiError.BadRequest(`Полисы СНИЛС не совпадают с данными Квазар.РИР`)
            }
            
            console.log(patientFormRir.data)
            const full_name = patientFormRir.data.lastName + ' ' + patientFormRir.data.firstName + ' ' + patientFormRir.data.middleName
            phone = '+7' + phone;
            const gender = patientFormRir.data.gender == 'М' ? 1 : 2;

            /* await prisma.$queryRaw`
                                                    INSERT INTO patient_documents (document_name, document_type_id, document_seies, document_number, document_date, given_by)
                                                    VALUES (${patientFormRir.data.document.type.name}, ${parseInt(patientFormRir.data.document.type.code)}, ${patientFormRir.data.document.seria}, ${patientFormRir.data.document.number},
                                                        ${new Date(patientFormRir.data.document.issueDate)}, ${patientFormRir.data.document.issuer})
            `
            const document = await prisma.$queryRaw`
                                                    SELECT *
                                                    from patient_documents pd
                                                    where pd.document_seies like ${patientFormRir.data.document.seria} and pd.document_number like ${patientFormRir.data.document.number}
                                                    order by pd.id desc
                                                    limit 1
            ` 
*/
            const document = await prisma.patient_documents.create({
                data: {
                    document_name: patientFormRir.data.document.type.name,
                    document_type_id: parseInt(patientFormRir.data.document.type.code),
                    document_seies: patientFormRir.data.document.seria,
                    document_number: patientFormRir.data.document.number,
                    document_date: new Date(patientFormRir.data.document.issueDate),
                    given_by: patientFormRir.data.document.issuer
                }
            })
            console.log(document)
            const patient = await prisma.patient.create({
                data: {
                    surname: patientFormRir.data.lastName,
                    name: patientFormRir.data.firstName,
                    patronomic_name: patientFormRir.data.middleName,
                    phone: phone,
                    email: email,
                    snils: snils.replace(/-| /g, ''),
                    polis: polis,
                    full_name: full_name,
                    birth_date: new Date(patientFormRir.data.birthdate),
                    rir_id: patientFormRir.data.id.toString(),
                    gender: {
                        connect: {id: parseInt(gender)},
                    },
                    address: patientFormRir.data.address ? patientFormRir.data.address.plain : null,
                    sp_district:{
                        connect: { id: district}
                    },
                    
                    
                    /* doc_id: {
                        create: {
                            document_name: patientFormRir.data.document.type.name,
                            document_type_id: parseInt(patientFormRir.data.document.type.code),
                            document_seies: patientFormRir.data.document.seria,
                            document_number: patientFormRir.data.document.number,
                            document_date: new Date(patientFormRir.data.document.issueDate),
                            given_by: patientFormRir.data.document.issuer
                        }
                    } */
                },  
              })
              await prisma.$queryRaw`update patient set doc_id = ${document.id} where id = ${patient.id}`

              await prisma.patient_documents.update({
                where: {
                    id: document.id
                },
                data: {
                    patient_id: patient.id
                }
              })

            patient.gender = parseInt(patient.gender)
            
            console.log(patient)
            //return userDto and tokens
            return patient;
        }
        catch (e) {
            console.log(e)
        }
    }

    async findPatient (label, choice) {
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
                            left join doctor d on d.id = uupd.doctor_id `;
            let whereQuery;
            switch (choice) {
                case '0':
                    whereQuery=`WHERE p.full_name like '%${label}%' `
                    break;
                case '1':
                    whereQuery=`WHERE p.polis like '%${label}%' `
                    break;
                case '2':
                    whereQuery=`WHERE p.snils like '%${label.replace(/-| /g, '')}%' `
                    break;
                default:
                    throw ApiError.BadRequest(`Нет параметров для поиска!`)
            }
            query += whereQuery + `order by uud.login`;
            const users = await prisma.$queryRawUnsafe(query)
            users.forEach(user => {
                user.p_gender_id = parseInt(user.p_gender_id)
            });
            return users
        }
        catch (e) {
            console.log(e)
        }
    }

    async findPatientAppointments (label, choice) {
        try {
            let query = `select uud.id as uud_id, uud.login  as uud_login, uud."password" as uud_password, uud.token_id as uud_token_id, 
                            uu.id as uu_id, uu.role_id as uu_role_id, uupd.id as uupd_id, uupd.patient_id as uupd_patient_id, uupd.doctor_id as uupd_doctor_id, 
                            p.id as p_id, p.surname as p_surname, p."name" as p_name, p.patronomic_name as p_patronomic_name, p.birth_date as p_birth_date,
                            p.phone as p_phone, p.email as p_email, p.snils , p.polis , p.full_name as p_full_name, p.gender_id as p_gender_id,
                            p.sp_district_id as p_sp_district_id, p.address as p_address, p.doc_id as p_doc_id, d.id as d_id, d.tabel_num,
                            d.surname as d_surname, d."name" as d_name, d.patronomic_name as d_patronomic_name, d.phone as d_phone, d.email as d_email,
                            d.birth_date as d_birth_date, d.med_post_id, d.full_name as d_full_name, d.gender_id as d_gender_id, a.*
                            from uirs_users_db uud
                            join uirs_users uu on uud.uirs_users_id = uu.id 
                            join uirs_users_patients_doctors uupd on uu.uirs_users_patients_doctors_id = uupd.id 
                            join appointment a on a.patient_id = uupd.patient_id
                            left join patient p on uupd.patient_id = p.id 
                            left join doctor d on d.id = uupd.doctor_id `;
            let whereQuery;
            switch (choice) {
                case '0':
                    whereQuery=`WHERE p.full_name like '%${label}%' `
                    break;
                case '1':
                    whereQuery=`WHERE p.polis like '%${label}%' `
                    break;
                case '2':
                    whereQuery=`WHERE p.snils like '%${label.replace(/-| /g, '')}%' `
                    break;
                default:
                    throw ApiError.BadRequest(`Нет параметров для поиска!`)
            }
            query += whereQuery + `order by uud.login`;
            const users = await prisma.$queryRawUnsafe(query)
            users.forEach(user => {
                user.p_gender_id = parseInt(user.p_gender_id)
            });
            return users
        }
        catch (e) {
            console.log(e)
        }
    }

    async findPatinetByChoiceAndDoctorId (label, choice, doctor_id) {


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
                        whereQuery=`WHERE p.full_name like '%${label}%' and d.id = ${doctor_id}`
                        break;
                    case '1':
                        whereQuery=`WHERE p.polis like '%${label}%' and d.id = ${doctor_id}`
                        break;
                    case '2':
                        whereQuery=`WHERE p.snils like '%${label.replace(/-| /g, '')}%' and d.id = ${doctor_id}`
                        break;
                    default:
                        throw ApiError.BadRequest(`Нет параметров для поиска!`)
                }
                query += whereQuery + `\norder by uud.login`;
    
                const users = await prisma.$queryRawUnsafe(query)
                return users
            }
            catch (e) {
                console.log(e)
            }
            /* try {

            let patients;
            switch (choice) {
                case '0':
                    patients = await prisma.$queryRawUnsafe(`
                        select a.*, p.*, d.full_name as d_full_name
                        from appointment a
                        join patient p on a.patient_id = p.id 
                        join doctor d on d.id = a.doctor_id
                        where p.full_name like '%${label}%'`)
                    break;
                case '1':
                    patients = await prisma.$queryRawUnsafe(`
                        select a.*, p.*, d.full_name as d_full_name
                        from appointment a
                        join patient p on a.patient_id = p.id 
                        join doctor d on d.id = a.doctor_id
                        where p.polis like '%${label}%'`)
                    break;
                case '2':
                    patients = await prisma.$queryRawUnsafe(`
                        select a.*, p.*, d.full_name as d_full_name
                        from appointment a 
                        join patient p on a.patient_id = p.id 
                        join doctor d on d.id = a.doctor_id
                        where p.snils like '%${label}%'`)
                    break;
                default:
                    throw ApiError.BadRequest(`Нет параметров для поиска!`)
            }
            patients.forEach(patient => {
                patient.gender = parseInt(patient.gender)
            });
            return patients;
        }
        catch (e) {
            console.log(e)
        } */
    }




    async addTonometr(tonometr_id, serialNum, deviceName) {
        try {
            const candidate = await prisma.device.findMany({
                where: {
                  OR: [
                    {
                        bluetoth_id: {
                            equals: tonometr_id,
                      },
                    },
                    {
                        serial_number: {
                            equals: serialNum,
                        }
                    },
                  ],
                },
              })
            if (candidate.length > 0) {
                return ApiError.BadRequest(`Тонометр уже был внесён в базу`)
            }
            const newTonometr = await prisma.device.create({
                data: {
                    serial_number: serialNum,
                    bluetoth_id: tonometr_id,
                    name: deviceName,
                }
            })
            return newTonometr;
        }
        catch (e) {
            console.log(e)
        }
    }

    async findTonometrByBtId (device_bt_id) {
        try {
            const candidate = await prisma.device.findFirst({
                where: {
                    name: device_bt_id
                }
            })
            
            if (!candidate) {
                return ApiError.BadRequest(`Тонометр не найден, пожалуйста, зарегистрируйте устройство`)
            }
            return candidate
        }
        catch (e) {
            console.log(e)
        }
    }

    async addAppointment (patient_id, doctor_id, device_id) {
        try {
            const appointment = await prisma.appointment.create({
                data: {
                    patient: {
                        connect: {id: parseInt(patient_id)},
                    },
                    doctor: {
                        connect: {id: parseInt(doctor_id)},
                    },
                    ap_date: new Date(),
                    device: {
                        connect: {id: parseInt(device_id)},
                    }
                }
            })
            return appointment
        }
        catch (e) {
            console.log(e)
        }
    }

    async closeAppointment (appointment_id) {
        try {
            const appointment = await prisma.appointment.update({
                where: {
                  id: appointment_id,
                },
                data: {
                  finished: 'Завершён',
                },
              })
            return appointment
        }
        catch (e) {
            console.log(e)
        }
    }

    

    async addMeasure (sys, dia, pul, device_id, user_id, deviceName) {
        try {
            const device = await prisma.device.findFirst({
                where: {
                    bluetoth_id: device_id
                }
            })
            const appointment = await prisma.appointment.findFirst({
                where: {
                    patient_id: user_id,
                    /* device_id: device.id, */
                },
                orderBy: {
                    ap_date: 'desc',
                },
            })
            const response = await prisma.monitoring_ton.create({
                data: {
                    upper_pressure: sys, //1YrnXIpL7MJn1nDPyIv+Cg==  1YrnXIpL7MJn1nDPyIv+Cg==
                    lower_pressure: dia,
                    heart_rate: pul,
                    appointment_id: appointment.id
                }
            })
            return response
        }
        catch (e) {
            console.log(e)
        }
    }

    async getAllMeasuresByPatientId (patient_id, page, order) {
        try {
            const offset = (page - 1) * 10;
            let orderBy;
            let asc_desc;
            switch (order) {
                case 'dt_dimension_desc':
                    orderBy = `mt.dt_dimension`
                    asc_desc = 'desc'
                    break;
                case 'dt_dimension_asc':
                    orderBy = `mt.dt_dimension`
                    asc_desc = 'asc'
                    break;
                case 'upper_pressure_desc':
                    orderBy = `mt.upper_pressure`
                    asc_desc = 'desc'
                    break;
                case 'upper_pressure_asc':
                    orderBy = `mt.upper_pressure`
                    asc_desc = 'asc'
                    break;
                case 'lower_pressure_desc': 
                    orderBy = `mt.lower_pressure`
                    asc_desc = 'desc'
                    break;  
                case 'lower_pressure_asc': 
                    orderBy = `mt.lower_pressure`
                    asc_desc = 'asc'
                    break; 
                case 'heart_rate_desc': 
                    orderBy = `mt.heart_rate`
                    asc_desc = 'desc'
                    break; 
                case 'heart_rate_asc': 
                    orderBy = `mt.heart_rate`
                    asc_desc = 'asc'
                    break; 
                case 'id_asc' :
                    orderBy = `mt.id`
                    asc_desc = 'asc'
                    break;
                case 'id_desc' :
                    orderBy = `mt.id`
                    asc_desc = 'desc'
                    break;
                default: 
                    orderBy = `mt.dt_dimension`
                    asc_desc = `desc`
                    break;
            }
            const response = await prisma.$queryRawUnsafe(`select * from appointment a    
                                                    join monitoring_ton mt on a.id = mt.appointment_id 
                                                    where a.patient_id = ${patient_id} 
                                                    order by ${orderBy} ${asc_desc}
                                                    limit 10 offset ${offset}`)
            return response;
        }
        catch (e) {
            console.log(e)
        }
    }

    async getPatientStatistic () {
        try {
            const statistic = await prisma.$queryRawUnsafe(`
                select mo.medical_org_name_small, count(distinct p.*), g.gender_name, vibivshie.cnt
                from patient p 
                join appointment a on a.patient_id = p.id 
                join doctor d on a.doctor_id = d.id 
                join med_post mp on d.med_post_id = mp.id 
                join medical_org mo on mo.id = mp.medical_org_id 
                join gender g on p.gender_id = g.id
                join (select count(distinct p2.*) as cnt, mo2.id as mo2_id
                    from patient p2 
                    join appointment a2 on p2.id = a2.patient_id 
                    join doctor d2 on d2.id = a2.doctor_id 
                    join med_post mp2 on mp2.id = d2.med_post_id 
                    join medical_org mo2 on mo2.id = mp2.medical_org_id 
                    where length(a2.finished) > 0
                    group by mo2.id
                ) as vibivshie on vibivshie.mo2_id = mo.id 
                group by mo.id, p.gender_id, g.id, vibivshie.cnt
            `)
            statistic.forEach((el) => {
                el.count = parseInt(el.count)
                el.cnt = parseInt(el.cnt)
            })
            return statistic
        }
        catch (e) {
            console.log(e)
        }
    }

    async getMesuaresByDoctorId (doctor_id, page, order) {
        try {
            const offset = (page - 1) * 10;
            let orderBy;
            let asc_desc;
            switch (order) {
                case 'full_name_desc':
                    orderBy = `p.full_name`
                    asc_desc = 'desc'
                    break;
                case 'full_name_asc':
                    orderBy = `p.full_name`
                    asc_desc = 'asc'
                    break;
                case 'dt_dimension_desc':
                    orderBy = `mt.dt_dimension`
                    asc_desc = 'desc'
                    break;
                case 'dt_dimension_asc':
                    orderBy = `mt.dt_dimension`
                    asc_desc = 'asc'
                    break;
                case 'upper_pressure_desc':
                    orderBy = `mt.upper_pressure`
                    asc_desc = 'desc'
                    break;
                case 'upper_pressure_asc':
                    orderBy = `mt.upper_pressure`
                    asc_desc = 'asc'
                    break;
                case 'lower_pressure_desc': 
                    orderBy = `mt.lower_pressure`
                    asc_desc = 'desc'
                    break;  
                case 'lower_pressure_asc': 
                    orderBy = `mt.lower_pressure`
                    asc_desc = 'asc'
                    break; 
                case 'heart_rate_desc': 
                    orderBy = `mt.heart_rate`
                    asc_desc = 'desc'
                    break; 
                case 'heart_rate_asc': 
                    orderBy = `mt.heart_rate`
                    asc_desc = 'asc'
                    break; 
                case 'id_asc' :
                    orderBy = `mt.id`
                    asc_desc = 'asc'
                    break;
                case 'id_desc' :
                    orderBy = `mt.id`
                    asc_desc = 'desc'
                    break;
                default: 
                    orderBy = `mt.dt_dimension`
                    asc_desc = `desc`
                    break;
            }
            const response = await prisma.$queryRawUnsafe(`select p.*, a.*, mt.*
            from monitoring_ton mt 
            join appointment a on mt.appointment_id = a.id
            join patient p on a.patient_id = p.id 
            where a.patient_id in (select p2.id 
                                from patient p2
                                join appointment a2 on a2.patient_id = p2.id
                                join doctor d on a2.doctor_id = d.id
                                where d.id = ${doctor_id})
                order by ${orderBy} ${asc_desc}
                limit 10 offset ${offset}`)
            return response;
        }
        catch (e) {
            console.log(e)
        }
    }

    async getMesuaresByMO (med_post_id, page, order) {
        try {
            const offset = (page - 1) * 10;
            let orderBy;
            let asc_desc;
            switch (order) {
                case 'full_name_desc':
                    orderBy = `p.full_name`
                    asc_desc = 'desc'
                    break;
                case 'full_name_asc':
                    orderBy = `p.full_name`
                    asc_desc = 'asc'
                    break;
                case 'dt_dimension_desc':
                    orderBy = `mt.dt_dimension`
                    asc_desc = 'desc'
                    break;
                case 'dt_dimension_asc':
                    orderBy = `mt.dt_dimension`
                    asc_desc = 'asc'
                    break;
                case 'upper_pressure_desc':
                    orderBy = `mt.upper_pressure`
                    asc_desc = 'desc'
                    break;
                case 'upper_pressure_asc':
                    orderBy = `mt.upper_pressure`
                    asc_desc = 'asc'
                    break;
                case 'lower_pressure_desc': 
                    orderBy = `mt.lower_pressure`
                    asc_desc = 'desc'
                    break;  
                case 'lower_pressure_asc': 
                    orderBy = `mt.lower_pressure`
                    asc_desc = 'asc'
                    break; 
                case 'heart_rate_desc': 
                    orderBy = `mt.heart_rate`
                    asc_desc = 'desc'
                    break; 
                case 'heart_rate_asc': 
                    orderBy = `mt.heart_rate`
                    asc_desc = 'asc'
                    break; 
                case 'id_asc' :
                    orderBy = `mt.id`
                    asc_desc = 'asc'
                    break;
                case 'id_desc' :
                    orderBy = `mt.id`
                    asc_desc = 'desc'
                    break;
                default: 
                    orderBy = `mt.dt_dimension`
                    asc_desc = `desc`
                    break;
            }

            const response = await prisma.$queryRawUnsafe(`select p.*, a.*, mt.*
            from med_post mp
            join medical_org mo on mp.medical_org_id = mo.id
            join doctor d on d.med_post_id = mp.id 
            join appointment a on d.id = a.doctor_id 
            join patient p on a.patient_id = p.id
            join monitoring_ton mt on mt.appointment_id = a.id
            where mo.id in (select mo2.id
                            from med_post mp2 
                            join medical_org mo2 on mp2.medical_org_id  = mo2.id 
                            where mp2.id  = ${med_post_id})
            order by ${orderBy} ${asc_desc}
            limit 10 offset ${offset}`)

            /* `select p.*, a.*, mt.*
            from monitoring_ton mt 
            join appointment a on mt.appointment_id = a.id
            join patient p on a.patient_id = p.id 
            where a.patient_id in (select p2.id 
                                from patient p2
                                join appointment a2 on a2.patient_id = p2.id
                                join doctor d on a2.doctor_id = d.id
                                where d.id = ${doctor_id})
                order by ${orderBy} ${asc_desc}
                limit 10 offset ${offset}` */
            return response;
        }
        catch (e) {
            console.log(e)
        }
    }

    

    async getPatientsByDoctorId (doctor_id, page, order) {
        try {
            const offset = (page - 1) * 10;
            let orderBy;
            let asc_desc;
            switch (order) {
                case 'full_name_desc':
                    orderBy = `p.full_name`
                    asc_desc = 'desc'
                    break;
                case 'full_name_asc':
                    orderBy = `p.full_name`
                    asc_desc = 'asc'
                    break;
                default: 
                    orderBy = `a.id`
                    asc_desc = `desc`
                    break;
            }

            /* 
            
            select p.*
            from doctor d 
            join appointment a on a.doctor_id = d.id 
            join patient p on p.id = a.patient_id
            join monitoring_ton mt on mt.appointment_id = a.id 
            where d.id = 1
            group by p.full_name, p.id
            order by full_name desc
            limit 10 offset 0
            
            */
            const response = await prisma.$queryRawUnsafe(`select p.*, a.*
                from doctor d 
                join appointment a on a.doctor_id = d.id 
                join patient p on p.id = a.patient_id
                where d.id = ${doctor_id}
                group by p.full_name, p.id, a.id
                order by ${orderBy} ${asc_desc}
                limit 10 offset ${offset}`)
            /* const response = await prisma.$queryRawUnsafe(`select p.*, a.*, mt.*
                from doctor d 
                join appointment a on a.doctor_id = d.id 
                join patient p on p.id = a.patient_id
                join monitoring_ton mt on mt.appointment_id = a.id 
                where d.id = ${doctor_id}
                order by ${orderBy} ${asc_desc}
                limit 10 offset ${offset}`) */
            return response;
        }
        catch (e) {
            console.log(e)
        }
    }

    async getPatientsByMO (med_post_id, page, order) {
        try {
            const offset = (page - 1) * 10;
            let orderBy;
            let asc_desc;
            switch (order) {
                case 'full_name_desc':
                    orderBy = `p.full_name`
                    asc_desc = 'desc'
                    break;
                case 'full_name_asc':
                    orderBy = `p.full_name`
                    asc_desc = 'asc'
                    break;
                default: 
                    orderBy = `a.id`
                    asc_desc = `desc`
                    break;
            }

            /* 
            
            select p.*
            from doctor d 
            join appointment a on a.doctor_id = d.id 
            join patient p on p.id = a.patient_id
            join monitoring_ton mt on mt.appointment_id = a.id 
            where d.id = 1
            group by p.full_name, p.id
            order by full_name desc
            limit 10 offset 0
            
            */
            const response = await prisma.$queryRawUnsafe(`select p.*, a.*
            from med_post mp
            join medical_org mo on mp.medical_org_id = mo.id
            join doctor d on d.med_post_id = mp.id 
            join appointment a on d.id = a.doctor_id
            join patient p on a.patient_id = p.id 
            where mo.id in (select mo2.id
                            from med_post mp2 
                            join medical_org mo2 on mp2.medical_org_id  = mo2.id 
                            where mp2.id  = ${med_post_id})
            order by ${orderBy} ${asc_desc}
            limit 10 offset ${offset}`)
           /*  `select p.*, a.*
                from doctor d 
                join appointment a on a.doctor_id = d.id 
                join patient p on p.id = a.patient_id
                where d.id = ${doctor_id}
                group by p.full_name, p.id, a.id
                order by ${orderBy} ${asc_desc}
                limit 10 offset ${offset}` */

            return response;
        }
        catch (e) {
            console.log(e)
        }
    }

    async getAllMeasuresByPatientIdWithDataFormat (patient_id, dateStart, dateEnd) {
        try {
            const id = parseInt(patient_id)

            const startDate = new Date(dateStart)
            const endDate = new Date(dateEnd)
            const startTime = startDate.setHours(startDate.getHours()+3)
            const endTime = endDate.setHours(endDate.getHours()+3)
            const start = new Date(startTime);
            const end = new Date(endTime);
            const response = await prisma.$queryRaw`select *
                from monitoring_ton mt 
                join appointment a on mt.appointment_id = a.id 
                join patient p on a.patient_id = p.id 
                where p.id = ${id} and mt.dt_dimension >= ${start} and mt.dt_dimension <= ${end}
                order by mt.dt_dimension`
            return response
        }
        catch(e) {
            console.log(e)
        }
    }
}


module.exports = new MainService();