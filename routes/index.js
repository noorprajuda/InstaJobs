const router = require('express').Router();
const UserController = require('../controllers/UserController');
const registerRoutes = require('./register')


router.get('/',UserController.home)
router.use('/register', registerRoutes)
router.get('/login',UserController.loginForm)

module.exports = router