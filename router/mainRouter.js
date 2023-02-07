const Router = require('express');
const router = new Router();
const MainController = require('../Controllers/MainController')

router.get('/', MainController.index);
router.post('/getResults', MainController.getResults);

module.exports = router;