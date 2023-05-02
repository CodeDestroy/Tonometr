const Router = require('express');
const router = new Router();

const AdminController = require('../Controllers/AdminController')

router.post('/showAllUsers', AdminController.showAllUsers);

router.post('/findUsers', AdminController.findUsers)
router.get('/getCountUsers',  AdminController.getCountUsers); 

router.get('/getCountMedOrgs', AdminController.getCountMedOrgs)
router.post('/saveOrAddOrg', AdminController.saveOrAddOrg)
router.post('/saveOrAddPost', AdminController.saveOrAddPost)
router.post('/saveOrAddDistrict', AdminController.saveOrAddDistrict)

router.get('/getMedPostsWithMO', AdminController.getMedPostsWithMO)
router.get('/getDistricts', AdminController.getDistricts)

router.post('/saveChangesToPatient', AdminController.saveChangesToPatient)
router.post('/saveChangesToUser', AdminController.saveChangesToUser)

module.exports = router;
