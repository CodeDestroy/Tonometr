const { Prisma } = require("@prisma/client");
const { response } = require("express");

class MainController {
    async index(req, res) {
        try {
            res.sendFile(__dirname + "/client/index.html"); 
        }
        catch (e) {
            console.log(e);
        }
    }

    async getResults(req, res) {
        try {
            if(!req.body) return res.sendStatus(400);
            await global.prisma.monitoring_ton.create({
                data: {
                    is_del: null,
                    upper_pressure: parseInt(req.body.SYS),
                    lower_pressure: parseInt(req.body.DIA),
                    heart_rate: parseInt(req.body.PUL),
                    apointment_id: 80629,
                    reaction: null,
                    measurement_comment: null
                },
              });
            res.send('Успешно')          
        }
        catch (e) {
            console.log(e);
        }
    }
}
module.exports = new MainController();
