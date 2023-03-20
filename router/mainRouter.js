const Router = require('express');
const router = new Router();

const MainController = require('../Controllers/MainController')

router.post('/fetch-pdf', MainController.fetchPDF)
router.post('/testPrint', MainController.testPrint);

router.post('/getResults', MainController.getResults);

router.post('/reg-patient', MainController.register)
router.post('/findPatientByChoice', MainController.findPatient)

router.post('/addTonometr', MainController.addTonometr)
router.post('/findTonometrByBtId', MainController.findTonometrByBtId)

router.post('/addAppointment', MainController.addAppointment)
router.post('/getCountMeasuresByPatientId', MainController.getCountMeasuresByPatientId)
router.post('/getAllMeasuresByPatientId', MainController.getAllMeasuresByPatientId)

module.exports = router;