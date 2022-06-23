
const { Op } = require("sequelize");
const { User, Applicant, Company, Job } = require("../models");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
var session = require('express-session')

class UserController {
    static home(req, res){
        if (req.session.role  === 'recruiter'){
            const UserId = req.session.userId
            User.findByPk(UserId,{
                include :[Company]
            })
            .then(result=>{
                res.render('recruiterHome',{result})
            })
            .catch(err=>{
                res.send(err)
            })
        }
        else if (req.session.role  === 'applicant') {
            const UserId = req.session.userId
            res.render('applicantHome', {UserId})
        }
        else{
            res.render('home')
        }
    }

    static registerForm(req, res){
        const {errors} = req.query

        User.findAll()
            .then(_=>{
                res.render('auth-pages/registerForm', {errors})
            })
            .catch(err => {
                res.send(err)

            })
        

    }

    static postRegister(req, res){
        const {email, password, role} = req.body

        User.create({email, password, role})
            .then(newUser=>{
                
                res.redirect('/login')
            })
            .catch(err=>{
                if (err.name === 'SequelizeValidationError') {
                    const errors = err.errors.map(el=> el.message)
                    // res.send(errors)
                    res.render(`auth-pages/registerForm`, {errors})
                } else {
                    res.send(err)

                }
                
            })
    }

    static loginForm(req, res){

        const {errors} = req.query

        User.findAll()
            .then(_=>{
                res.render('auth-pages/loginForm', {errors})
            })
            .catch(err => {
                res.send(err)

            })
        
    }

    static postLogin(req, res){
        const {email, password} = req.body

        User.findOne({where: {email: email}})
            .then(user=>{
                if (user) {
                    const isValidPassword = bcrypt.compareSync(password, user.password)

                    if (isValidPassword) {

                        req.session.userId = user.id
                        req.session.role = user.role
                        console.log(req.session.userId);

                        return res.redirect('/')
                        
                    } else {
                        const errors= 'Invalid username or password'
                        return res.redirect(`/login?errors=${errors}`)
                    }
                    
                } else {
                    const errors= 'Invalid username or password'
                    return res.redirect(`/login?errors=${errors}`)
                }
                
            })
            .catch(err=>{
                console.log(err);
                res.send(err)
            })
    }

    static table(req, res) {
        res.render('table')
    }

    static mvp(req, res) {
        res.render('mvp')
    }

    static editProfile(req, res) {
        const UserId = req.session.userId
        
        User.findByPk(UserId)
            .then(user =>{
                res.render(`editProfile`, {user})
            })
            .catch(err=>{
                
                res.send(err)
            })
    }

    static saveProfile(req, res) {
        const UserId = req.session.userId
        const {fullName, gender, skill, email, password} = req.body
        
        User.update({fullName, gender, skill, email, password},{where:{id: UserId}, 
            individualHooks: true})
            .then(_ =>{
                res.redirect('/')
            })
            .catch(err =>{
                
                res.send(err)
            })
    }

    static vacantJobList(req, res) {
        Job.findAll({include: [Company] })
            .then(jobs =>{
                res.render(`jobList`, {jobs})
            })
            .catch(err=>{
                
                res.send(err)
            })
    }

    static applyJob(req, res) {
        console.log(req.session); 
        const UserId = req.session.userId
        const {JobId, CompanyId} = req.body
        console.log(req.body); 
        Applicant.create({JobId, UserId, CompanyId})
            .then(applicants =>{
                res.render(`applicantsTable`, {applicants})
            })
            .catch(err=>{
                console.log(err);
                res.send(err)
            })
    }

    static applicantsTable(req, res) {
        Applicant.findAll({include: [Company, Job, User] })
            .then(applicants =>{
                res.render(`applicantsTable`, {applicants})
            })
            .catch(err=>{
                console.log(err);
                res.send(err)
            })
    }

    static jobList(req, res) {

        let { name } = req.query
        let options = { include: Company, order: [['createdAt', 'DESC']] }

        if (name) {
            options.where = {...options.where, name: {[Op.iLike]: `%${name}%`} }
        }

        Job.scopeNotVacantJob(options
        )
            .then(jobs => {
                res.render('jobList', { jobs });
            })
            .catch(err => {

                console.log(err);
                res.send(req.query);
            })
    }

    static jobListDetail(req, res) {
        const JobId = +req.params.JobId
        console.log(req.params);
        
        Job.findOne(
            {include: [Applicant, Company],
            where: 
            {
                id: JobId
            },
            required: true
            })
            .then(job => {
                
                res.render('jobListDetail', { job });
            })
            .catch(err => {
                
                res.send(err);
            })
    }

    static applyJob(req, res) {
        const { errors } = req.query
        const JobId = +req.params.JobId
        
        Job.findOne(
            {include: [Company, Applicant],
            where: 
            {
                id: JobId
            },
            required: true
            })
            .then(job => {
                
                
                res.render('apply', { job, errors });
            })
            .catch(err => {
                
                res.send(err);
            })
    }

    static saveApplyJob(req, res) {
        const JobId = req.params.JobId
        const UserId = req.session.userId
        const {fullName, gender, email, phone, CompanyId} = req.body
        Applicant.create({fullName, gender, email, phone, JobId, UserId, CompanyId})
            .then(result => {
                res.redirect(`/jobList/${JobId}/detail`)
            })
            .catch(err => {
                if (err.name === 'SequelizeValidationError') {
                    const errors = err.errors.map(el=> el.message)
                    res.redirect(`/jobList/${JobId}/apply?errors=${errors}`)
                }
                else res.send(err)
            })
    }



    // static masters(req, res){
    //     Master.findAll({include: [Student]})
    //         .then(masters=>{
    //             res.render('masters', {masters})
    //         })
    //         .catch(err=>{
                
    //             res.send(err)
    //         })
        
    // }

    // static students(req, res){
    //     const {name}  = req.query
    //     let options = {include: [Master]}
    //     if (name) {
    //         options.where = {name:{[Op.iLike]: `%${name}%`}}
    //     }

    //     Student.findAll(options)
    //         .then(students=>{
    //             res.render('students', {students})
    //         })
    //         .catch(err=>{
                
    //             res.send(err)
    //         })
        
    // }

    // static addStudent(req, res){
    //     Master.findAll({include: [Student]})
    //         .then(masters=>{
    //             res.render('formAdd', {masters})
    //         })
    //         .catch(err=>{
                
    //             res.send(err)
    //         })
        
    // }

    // static saveStudent(req, res){
    //     const { name, specialist, MasterId } = req.body
    //     Student.create({ name, specialist, MasterId })
    //         .then(_ =>{
                
    //             res.redirect('/students')
    //         })
    //         .catch(err=>{
                
    //             if (err.name = "SequelizeValidationError") {
    //                 err = err.errors.map(el=>el.message)
    //                 res.send(err)
    //             }
    //             res.send(err)
    //         })
        
    // }

    // static trainStudent(req, res){

    //     const {studentId} = req.params
        
    //     Student.increment({ exp: specialistSame() }, {where: {id:studentId}})
    //         .then(_ =>{
    //             console.log(req.body);
    //             res.redirect(`/masters/${studentId}/train`)
    //         })
    //         .catch(err=>{
    //             console.log(err);
    //             if (err.name = "SequelizeValidationError") {
    //                 err = err.errors.map(el=>el.message)
    //                 res.send(err)
    //             }
    //             res.send(err)
    //         })
        
    // }

    // static graduateStudent(req, res){
    //     const {studentId} = req.params
        
        
    //     Student.update({ isGraduate: true }, {where: {id:studentId}})
    //         .then(_ =>{
    //             res.redirect('/masters')
    //         })
    //         .catch(err=>{
    //             res.send(err)
    //         })
        
    // }

    // static masterStudents(req, res){
    //     const {masterId}= req.params
        
    //     Master.findByPk(masterId, {include: [Student]})
    //         .then(master=>{
    //             res.render('masterStudents', {master, specialistSame, specialistNotSame})
    //         })
    //         .catch(err=>{
                
    //             res.send(err)
    //         })
        
    // }
}

module.exports = UserController