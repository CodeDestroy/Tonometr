const ApiError = require('../exeptions/api-error');

class MainService {
    //registration method
    async addPatient (surname, name, patronomic_name, phone, email, snils, polis, birth_date, gender, address, district) {
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
                throw ApiError.BadRequest(`Пользователь ${surname} ${name} ${patronomic_name} со СНИЛС ${snils} уже был зарегестрирован, пожалуйста, обратитесь к системному администратору`)
            }

            //hash password
            /* const pass_to_hash = password.valueOf();
            const hashPassword = bcrypt.hashSync(pass_to_hash, 8); */
            
            /* const nick = User_nick; 
            const name = User_name;
            const surname = User_surname; */
            const full_name = surname + ' ' + name + ' ' + patronomic_name
            //const small_name =  secondName + ' ' + firstName.substring(0, 1) + ". " + patronomicName.substring(0, 1) + ". "
            phone = '+7' + phone;
            //console.log(await tokenService.)
            const patient = await prisma.patient.create({
                data: {
                    surname: surname,
                    name: name,
                    patronomic_name: patronomic_name,
                    phone: phone,
                    email: email,
                    snils: snils,
                    polis: polis,
                    full_name: full_name,
                    birth_date: birth_date,
                    gender: {
                        connect: {id: parseInt(gender)},
                    },
                    address: address,
                    sp_district:{
                        connect: { id: district}
                    } 
                },  
              })

            patient.gender = parseInt(patient.gender)
            
            //return userDto and tokens
            return patient;
        }
        catch (e) {
            console.log(e)
        }
    }

    async findPatient (label, choice) {
        try {
            let patients;
            switch (choice) {
                case '0':
                    patients = await prisma.patient.findMany({
                        where: {
                            full_name: label,
                        },
                      })
                    break;
                case '1':
                    patients = await prisma.patient.findMany({
                        where: {
                            polis: label,
                        },
                      })
                    break;
                case '2':
                    patients = await prisma.patient.findMany({
                        where: {
                            snils: label,
                        },
                      })
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
        }
        
    }
    async addTonometr(tonometr_id, serialNum, deviceName) {
        try {
            console.log(deviceName)
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
                    bluetoth_id: device_bt_id
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
            console.log(patient_id, doctor_id, device_id)
            const appointment = await prisma.appointment.create({
                data: {
                    patient_id: patient_id,
                    doctor_id: doctor_id,
                    ap_date: new Date(),
                    device_id: device_id
                }
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
            console.log(device_id)
            const appointment = await prisma.appointment.findFirst({
                where: {
                    patient_id: user_id,
                    /* device_id: device.id, */
                },
                orderBy: {
                    ap_date: 'desc',
                },
            })
            console.log(appointment)
            const response = await prisma.monitoring_ton.create({
                data: {
                    upper_pressure: sys, //1YrnXIpL7MJn1nDPyIv+Cg==  1YrnXIpL7MJn1nDPyIv+Cg==
                    lower_pressure: dia,
                    heart_rate: pul,
                    appointment_id: appointment.id
                }
            })
            console.log(response)
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
}


module.exports = new MainService();