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

}


module.exports = new MainService();