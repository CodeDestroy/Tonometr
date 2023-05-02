const axios = require("axios");

const API_URL = 'http://rir-test.medsoft.su:80/' 
module.exports = API_URL
const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL,
    host: process.env.SERVER_HOST
});

$api.interceptors.request.use((config) => {
    
        config.headers.Authorization = `Bearer ${process.env.RIR_TOKEN}`;
    return config;
});

module.exports = $api;