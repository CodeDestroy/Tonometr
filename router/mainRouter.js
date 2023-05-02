const Router = require('express');
const router = new Router();

const MainController = require('../Controllers/MainController')

router.post('/fetch-pdf', MainController.fetchPDF)
router.post('/createContract', MainController.createContract);
/* createContract */
router.post('/createReturnAct', MainController.createReturnAct);
/* router.post('/getActReturnFileNameByApID', MainController.getActReturnFileNameByApID); */



router.post('/getContractFileName', MainController.getContractFileName);
router.post('/getContractFileNameByApID', MainController.getContractFileNameByApID)
router.post('/getReturnActFileNameByApID', MainController.getReturnActFileNameByApID)

router.post('/getResults', MainController.getResults);

router.post('/reg-patient', MainController.register)
router.post('/findPatientByChoice', MainController.findPatient)
router.post('/findPatientAppointments', MainController.findPatientAppointments)

router.post('/findPatinetByChoiceAndDoctorId', MainController.findPatinetByChoiceAndDoctorId)

router.post('/addTonometr', MainController.addTonometr)
router.post('/findTonometrByBtId', MainController.findTonometrByBtId)

router.post('/addAppointment', MainController.addAppointment)
router.post('/closeAppointment', MainController.closeAppointment)

router.post('/getCountMeasuresByPatientId', MainController.getCountMeasuresByPatientId)
router.post('/getCountMeasuresByDoctorId', MainController.getCountMeasuresByDoctorId)
router.post('/getCountMeasuresByMO', MainController.getCountMeasuresByMO)

router.get('/getPatientStatistic', MainController.getPatientStatistic)


router.post('/getCountPatientsByDoctorId', MainController.getCountPatientsByDoctorId)
router.post('/getCountPatientsByMO', MainController.getCountPatientsByMO)

router.post('/getPatientsByDoctorId', MainController.getPatientsByDoctorId)
router.post('/getPatientsByMO', MainController.getPatientsByMO)
router.post('/getPatientsById', MainController.getPatientsById)
router.post('/getDoctorById', MainController.getDoctorById)

router.post('/getAllMeasuresByPatientId', MainController.getAllMeasuresByPatientId)
router.post('/getMeasuresByManyPatients', MainController.getMeasuresByManyPatients)

router.post('/getMesuaresByDoctorId', MainController.getMesuaresByDoctorId)

router.post('/getMesuaresByMO', MainController.getMesuaresByMO)
router.get('/getDistricts', MainController.getDistricts)


router.post('/getAllMeasuresByPatientIdWithDataFormat', MainController.getAllMeasuresByPatientIdWithDataFormat)

router.post('/getMedOrg', MainController.getMedOrg)
router.post('/getMedOrgById', MainController.getMedOrgById)
router.post('/getMedPostById', MainController.getMedPostById)

router.post('/getPostByOrgId', MainController.getPostByOrgId)

router.get('/getRoles', MainController.getRoles)
router.post('/getAvailableRoles', MainController.getAvailableRoles)

router.post('/getMKB', MainController.getMKB)
router.post('/setChangesToPatient', MainController.setChangesToPatient)
router.post('/getAnamnesisByPatinetId', MainController.getAnamnesisByPatinetId)

router.post('/getDirByDoctorId', MainController.getDirByDoctorId)

module.exports = router;