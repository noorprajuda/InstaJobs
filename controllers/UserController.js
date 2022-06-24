
const { Op } = require("sequelize");
const { User, Applicant, Company, Job } = require("../models");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
const {google} = require('calendar-link')
const open = require('open')
const formatCurrency = require('../helper/formatter')

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

    static addCompany(req,res){
        res.render('addCompany')
    }
    
    static addCompanyDet(req,res){
        const UserId = req.session.userId
        const {name} = req.body
        const {createdAt,updatedAt} = new Date()
        Company.create ({name,createdAt,updatedAt,UserId})
        .then(result =>{
            res.redirect('/')
        })
        .catch(err=>{
            res.send(err)
        })
        
    }

    static manageJob(req,res) {
        const UserId = req.session.userId
        Company.findAll({
            include:[Job],
            where:{
                UserId : UserId
            }
        })
        .then(result=>{
            res.render(`managejob`,{result,formatCurrency})
        })
        .catch(err=>{
            res.send(err)
        })
    }


    static addJobPage(req,res){
        const CompanyId = req.params.CompanyId
        res.render('addJob',{CompanyId})
    }

    static editProfile(req, res) {
        const {errors} = req.query
        const UserId = req.session.userId
        
        User.findByPk(UserId)
            .then(user =>{
                res.render(`editProfile`, {user, errors})
            })
            .catch(err=>{
                
                if (err.name === 'SequelizeValidationError') {
                    const errors = err.errors.map(el=> el.message)
                    res.redirect(`/editProfile/${UserId}?errors=${errors}`)
                } else {
                    res.send(err)
                }
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
                
                if (err.name === 'SequelizeValidationError') {
                    const errors = err.errors.map(el=> el.message)
                    res.redirect(`/editProfile/${UserId}?errors=${errors}`)
                } else {
                    res.send(err)
                }
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



    static addJob(req,res){
        const CompanyId = req.params.CompanyId
        const { title,vacancy,requirement,salary } = req.body
        const {createdAt,updatedAt} = new Date()
        Job.create({ title,vacancy,requirement,salary,createdAt,updatedAt,CompanyId })
        .then(result =>{
            res.redirect(`/managejob/${CompanyId}`)
        })
    }

    static deleteJob(req,res){
        const CompanyId = req.params.CompanyId
        const id = req.params.id
        Job.destroy({where:{id:id}})
        .then(result=>{
            res.redirect(`/managejob/${CompanyId}`)
        })
        .catch(err=>{
            res.send(err)
        })
    }

    static editJobPage(req,res){
        const CompanyId = req.params.CompanyId
        const id = req.params.id
        Job.findByPk(id)
        .then(result=>{
            res.render('editJob',{result})
        })
        .catch(err=>{
            res.send(err)
        })
    }

    static editJob(req,res){
        const CompanyId = req.params.CompanyId
        const id = req.params.id
        const { title,vacancy,requirement,salary } = req.body
        Job.update({ title,vacancy,requirement,salary },{
            where:{
                id:id
            }
        })
        .then(result=>{
            res.redirect(`/managejob/${CompanyId}`)
        })
        .catch(err=>{
            res.send(err)
        })
    }

    static findApplicants(req,res){
        const CompanyId = req.params.CompanyId
        const {search} = req.query
        const options = {
                include : [{model:User,where:{}},Job],
                where:{
                    CompanyId:CompanyId
            }
        }
        if(search) options.include[0].where.fullName={[Op.iLike]:`%${search}%`}
        Applicant.findAll(options)
        .then(result=>{
            res.render('applicantList',{result})
        })
        .catch(err=>{
            res.send(err)
        })
    }

    static rejectApplicant(req,res){
        const CompanyId = req.params.CompanyId
        const id = req.params.id
        Applicant.update({status:'Rejected'},{
            where:{
                id:id
                }
        })
        .then(result=>{
            res.redirect(`/applicantList/${CompanyId}`)
        })
        .catch(err=>{
            res.send(err)
        })
    }

    static approveApplicant(req,res){
        const CompanyId = req.params.CompanyId
        const id = req.params.id
        Applicant.findByPk(id,{
            include : [User,Job]})
        .then(result=>{
            res.render('approvePage',{result})
        })
        .catch(err=>{
            res.send(err)
        })
    }

    static approved(req,res){
        const CompanyId = req.params.CompanyId
        const id = req.params.id
        const {fullName,email,interviewDate} = req.body
        const event = {
            title: `Interview for ${fullName}`,
            description: "Don't be late!",
            start: `${interviewDate}`,
            guests: [`${email}`]
        }
        Applicant.update({status:'Approved',interviewDate:`${interviewDate}`},{
            where:{
                id:id
            }
        })
        .then(result=>{
            open(google(event),"_blank")
            res.redirect(`/applicantList/${CompanyId}`)
        })
        .catch(err=>{
            res.send(err)
        })
    }

    static table(req, res) {
        res.render('table')
    }

    static mvp(req, res) {
        res.render('mvp')
    }
}

module.exports = UserController