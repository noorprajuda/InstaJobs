
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
            res.send('test')
        }
        else{
            res.render('home')
        }
    }

    static registerForm(req, res){
        res.render('auth-pages/registerForm')
    }

    static postRegister(req, res){
        const {email, password, role} = req.body

        User.create({email, password, role})
            .then(newUser=>{
                
                res.redirect('/login')
            })
            .catch(err=>{
                
                res.send(err)
            })
    }

    static loginForm(req, res){
        const {error} = req.query
        res.render('auth-pages/loginForm', {error})
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
                        const error= 'Invalid username or password'
                        return res.redirect(`/login?error=${error}`)
                    }
                    
                } else {
                    const error= 'Invalid username or password'
                    return res.redirect(`/login?error=${error}`)
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