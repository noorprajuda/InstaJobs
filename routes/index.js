const router = require('express').Router();
const UserController = require('../controllers/UserController');
const registerRoutes = require('./register')
var session = require('express-session')




router.get('/',UserController.home)
router.use('/register', registerRoutes)
router.get('/login',UserController.loginForm)
router.post('/login',UserController.postLogin)

const isLoggedIn = function (req,res,next) {
    // console.log(req.session);
    if (!req.session.userId) {
        const error = 'Please login first!'
        res.redirect(`/login?error=${error}`)
    } else {
        next()
    }
}

const isRecruiter = function (req,res,next) {
    // console.log(req.session);
    if (req.session.userId && req.session.role !== 'recruiter') {
        const error = 'You have no access'
        res.redirect(`/login?error=${error}`)
    } else {
        next()
    }
}


router.get('/table', isLoggedIn, UserController.table)
router.get('/mvp', isLoggedIn, isRecruiter, UserController.mvp)

module.exports = router