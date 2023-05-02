const axios = require("axios");
const $api = require('../http/index')
class RirService {

    async getPatientByPolis (polis) {//3667750839000120
        return $api.get(`/mpi/api/v2.0/persons/search/insurance?number=${polis}`) 
    }
    async getPatientById (id) {//3667750839000120
        return $api.get(`/mpi/api/v2.0/persons/${id}`) 
    }
}

module.exports = new RirService();