const UserController = require('../controllers/UserController');

const router = require('express').Router();

router.get('/', UserController.registerForm)
router.post('/', UserController.postRegister)


module.exports = router