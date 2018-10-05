const express = require('express');
const router = express.Router();
const mysql = require('promise-mysql');
const checkAuth = require("../auth/checkAuth");
const adminAuth = require("../auth/adminAuth");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const salt = bcrypt.genSaltSync(10);

var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var JWT_Organization = 'mygeheim';

var pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "ITRW324",
    database: 'selit_database'
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: 'selitnotifier@gmail.com',
    pass: 'selititrw324'
    }
  });

//Method for registration of a student
router.post('/register',jsonParser,(req,res,next)=>{
    var mailOptions = {
        from: 'selitnotifier@gmail.com',
        to: req.body.email_address,
        cc: 'gvanwyk0@gmail.com',
        subject: 'Registering for SELIT secondhand textbook store.',
        text: 'You have just registered. Now you can use the services SELIT provides to students at the North-West University of Potchefstroom.'
    };
  
    var hash = bcrypt.hashSync(req.body.password,salt);
        console.log('Password hash success');
        var student = {
            Student_Number:                     req.body.student_number,
            First_Name:                         req.body.first_name,
            Last_Name:                          req.body.last_name,
            Contact_Number:                     req.body.contact_number,
            Email_Address:                      req.body.email_address,
            Password:                           hash,
            PROVINCE_Province_Number:           req.body.province_number,
            HOSTEL_Hostel_Number:               req.body.hostel_number,
            STUDENT_OFFENCE_Offence_Number:     req.body.offence_number,
            student:                            req.body.student,
            admin:                              req.body.admin
        };

        var istudent = 'INSERT INTO student set ?';
        console.log(student);
        pool.getConnection()
        .then(function(connection) {
            connection.query(istudent, student, (err,ress)=>{
                if(ress){
                    res.status(201).json({message: "User registered"} );
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent to ' + req.body.student_number + ' using '+ req.body.email_address);
                        }
                    });
                } else if(err){
                    res.status(422).json({message: err});
                }
            });
        })
        .catch(function(err) {
            console.log('Error has occured.');
        });
});

router.post('/login',jsonParser,(req,res,next)=>{
    var rstudent = 'SELECT * FROM student WHERE student_number = ?';
    var studentNumber = req.body.student_number;
    var password = req.body.password;
    pool.getConnection()
    .then(function(connection) {
        var conn = connection;
        return connection.query(rstudent, studentNumber);
    })
    .then(function(studentRows){
        var mailOptions = {
            from: 'selitnotifier@gmail.com',
            to: studentRows[0].Email_Address,
            cc: 'gvanwyk0@gmail.com',
            subject: 'SELIT security',
            text: 'You have just logged Into your SELIT Account'
        };

        var passwordmatch = bcrypt.compareSync(password, studentRows[0].Password);
            if(passwordmatch === false){
                return res.status(401).json({message:'Authentication failed'});
            }
      
            if(passwordmatch == true)
            {
                console.log(studentRows[0]);
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent to ' + req.body.student_number + ' using '+ studentRows[0].Email_Address);
                    }
                });

                const tokenv = jwt.sign({
                    student_number: studentRows[0].Student_Number, 
                    student: studentRows[0].Student, 
                    admin: studentRows[0].Admin},
                    JWT_Organization,
                    {expiresIn: '1h'});
                return res.status(200).json({body:tokenv});
            }
            res.status(401).json({message:'Authentication failed'});
    })
    .catch(err=>{ if(err){res.status(500).json({message:'Login Failed'});
    console.log(err);
    }});
});

module.exports = router;