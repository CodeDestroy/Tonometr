const Router = require('express');
const router = new Router();

const MainController = require('../Controllers/MainController')

router.post('/testPrint', MainController.testPrint);
router.post('/getResults', MainController.getResults);
router.post('/fetch-pdf', MainController.fetchPDF)

module.exports = router;