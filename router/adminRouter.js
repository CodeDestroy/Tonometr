const Router = require('express');
const router = new Router();

const AdminController = require('../Controllers/AdminController')

router.post('/showAllUsers', AdminController.showAllUsers);


//router.get('/users', authMiddleware,  authController.getUsers); 

module.exports = router;
