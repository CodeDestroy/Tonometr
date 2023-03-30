const Router = require('express');
const router = new Router();

const AdminController = require('../Controllers/AdminController')

router.post('/showAllUsers', AdminController.showAllUsers);

router.post('/findUsers', AdminController.findUsers)
router.get('/getCountUsers',  AdminController.getCountUsers); 

router.post('/saveChangesToPatient', AdminController.saveChangesToPatient)
module.exports = router;
