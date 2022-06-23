
const { Op } = require("sequelize");
const { User, Applicant, Company, Job } = require("../models");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
var session = require('express-session')

class UserController {
    static home(req, res){
        res.render('home')
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

    static table(req, res) {
        res.render('table')
    }

    static mvp(req, res) {
        res.render('mvp')
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