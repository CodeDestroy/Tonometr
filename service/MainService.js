const ApiError = require('../exeptions/api-error');

class MainService {
    //registration method
    async addPatient (secondName, firstName, patronomicName, phone, email, snils, polis, birthDate, gender, adress, district) {
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
                throw ApiError.BadRequest(`Пользователь ${secondName} ${firstName} ${patronomicName} со СНИЛС ${snils} уже был зарегестрирован, пожалуйста, обратитесь к системному администратору`)
            }

            //hash password
            /* const pass_to_hash = password.valueOf();
            const hashPassword = bcrypt.hashSync(pass_to_hash, 8); */
            
            /* const nick = User_nick; 
            const name = User_name;
            const surname = User_surname; */
            const full_name = secondName + ' ' + firstName + ' ' + patronomicName
            const small_name =  secondName + ' ' + firstName.substring(0, 1) + ". " + patronomicName.substring(0, 1) + ". "
            phone = '+7' + phone;
            //console.log(await tokenService.)
            const patient = await prisma.patient.create({
                data: {
                    famil: secondName,
                    fname: firstName,
                    otch: patronomicName,
                    phone: phone,
                    email: email,
                    snils: snils,
                    polis: polis,
                    full_name: full_name,
                    small_name: small_name,
                    birthday: birthDate,
                    gender: gender,
                    address_fact: adress,
                    sp_district_id: district,
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

}


module.exports = new MainService();