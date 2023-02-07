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
            res.send('Успешно')
            console.log(req.body)
        }
        catch (e) {
            console.log(e);
        }
    }
}
module.exports = new MainController();
