const router = require('express').Router();
const UserController = require('../controllers/UserController');
const registerRoutes = require('./register')
var session = require('express-session')




router.get('/',UserController.home) 
router.use('/register', registerRoutes)
router.get('/login',UserController.loginForm)
router.get('/addCompany',UserController.addCompany)
router.post('/addCompany',UserController.addCompanyDet)
router.get('/manageJob/:CompanyId',UserController.manageJob)
router.get('/manageJob/:CompanyId/addJob',UserController.addJobPage)
router.post('/manageJob/:CompanyId/addJob',UserController.addJob)
router.get('/manageJob/:CompanyId/deleteJob/:id',UserController.deleteJob)
router.get('/manageJob/:CompanyId/editJob/:id',UserController.editJobPage)
router.post('/manageJob/:CompanyId/editJob/:id',UserController.editJob)
router.get('/applicantList/:CompanyId',UserController.findApplicants)
router.get('/applicantList/:CompanyId/reject/:id',UserController.rejectApplicant)
router.get('/applicantList/:CompanyId/approve/:id',UserController.approveApplicant)
router.post('/applicantList/:CompanyId/approve/:id',UserController.approved)
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
        const errors = 'You have no access'
        res.redirect(`/login?errors=${errors}`)
    } else {
        next()
    }
}

const isApplicant = function (req,res,next) {
  // console.log(req.session);
  if (req.session.userId && req.session.role !== 'applicant') {
      const errors = 'You have no access'
      res.redirect(`/login?errors=${errors}`)
  } else {
      next()
  }
}


router.get('/table', isLoggedIn, UserController.table)
router.get('/mvp', isLoggedIn, isRecruiter, UserController.mvp)

router.get('/editProfile/:id', UserController.editProfile)
router.post('/editProfile/:id', isLoggedIn, isApplicant, UserController.saveProfile)

router.get('/jobList', isLoggedIn, isApplicant, UserController.vacantJobList)
// router.get('/jobList', isLoggedIn, isRecruiter, UserController.mvp)

router.get('/jobList', UserController.jobList)
router.get('/jobList/:JobId/detail', isLoggedIn, isApplicant, UserController.jobListDetail)
router.get('/jobList/:JobId/apply', isLoggedIn, isApplicant, UserController.applyJob)
router.post('/jobList/:JobId/apply', isLoggedIn, isApplicant, UserController.saveApplyJob)

router.post('/apply', isLoggedIn, isApplicant, UserController.applyJob)
router.get('/applicants', isLoggedIn, isApplicant, UserController.applicantsTable)


router.get('/logout', (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          res.status(400).send('Unable to log out')
        } else {
          res.send('Logout successful')
        }
      });
    } else {
      res.end()
    }
  })

module.exports = router