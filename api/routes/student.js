//URL:  http://localhost:3000/student
//Student table/route needs the following:
//Admin can read
//Public can register for services and log in
//Student can't be deleted as of v.1.0.0

//Constant variables and variables for all used api's and directories
const express = require('express');
const router = express.Router();
const mysql = require('promise-mysql');
const adminAuth = require("../auth/adminAuth");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const salt = bcrypt.genSaltSync(10);
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var JWT_Organization = 'mygeheim';

//Creation of a pool to connect to the MySQL database
var pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "ITRW324",
    database: 'selit_database'
});

//Creation of the transporter to send emails
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: 'selitnotifier@gmail.com',
    pass: 'selititrw324'
    }
});

//Create Student
//This method is used to register a student for the system
//URL:  http://localhost:3000/student/register
//Requested data:       student_number
//                      first_name
//                      last_name
//                      contact_number
//                      email_address
//                      password ---- wil be encoded at web service
//                      province_name
//                      hostel_name
//                      student ---- default 1
//                      admin ---- default 0
//Data sent:            200 If the creation was successful
//                      400 If the creation was unsuccessful
try{
    router.post('/register',jsonParser,(req, res, next)=>{
        //Creating the email to be send when a student registers
        var mailOptions = {
            from: 'selitnotifier@gmail.com',
            to: req.body.email_address,
            subject: 'Registering for SELIT secondhand textbook store.',
            text: 'You have just registered. Now you can use the services SELIT provides, to the students at the North-West University of Potchefstroom.'
        };
    
        //Creating SQL variables to Create a student
        var istudent = 'INSERT INTO student set ?';
        var fStudent = 'SELECT * FROM student WHERE student_number = ?'
        var fProvince = 'SELECT * FROM province WHERE province_name = ?'
        var fHostel = 'SELECT * FROM hostel WHERE hostel_name = ?'
    
        //Creating variables for data that was not requested
        var provinceNumber;
        var hostelNumber;
    
        //Hasing the password and adding salt to encrypt it
        var hash = bcrypt.hashSync(req.body.password,salt);
    
        //Getting a connection to the MySQL database
        pool.getConnection()
        .then(function(conn) {
            connection = conn;
            //Sending the SQL query to the database and making a PROMISE
            return connection.query(fProvince, req.body.province_name);
        })
        .then(function(provinceRow){
            //If statement to test if the data exist that you are looking for
            if(provinceRow === 0){
                res.status(400).json({message:'Province does not exist.'});
                connection.release();
            } else {
                provinceNumber = provinceRow[0].Province_Number;
            }
            //Sending the SQL query to the database and making a PROMISE
            return connection.query(fHostel, req.body.hostel_name);
        })
        .then(function(hostelRow){
            //If statement to test if the data exist that you are looking for
           if(hostelRow === 0){
                res.status(400).json({message:'Hostel does not exist.'});
                connection.release();
            } else {
                hostelNumber = hostelRow[0].Hostel_Number;
            }
            //Sending the SQL query to the database and making a PROMISE
            return connection.query(fStudent, req.body.student_number);
        })
        .then(function(studentRow){
            //If statement to test if the data exist that you want to create
            if(studentRow.length === 0){
                var student = 
                {
                    Student_Number:                     req.body.student_number,
                    First_Name:                         req.body.first_name,
                    Last_Name:                          req.body.last_name,
                    Contact_Number:                     req.body.contact_number,
                    Email_Address:                      req.body.email_address,
                    Password:                           hash,
                    PROVINCE_Province_Number:           provinceNumber,
                    HOSTEL_Hostel_Number:               hostelNumber,
                    student:                            req.body.student,
                    admin:                              req.body.admin
                };
                
                //Sending the SQL query to the database
                connection.query(istudent, student, (err,ress)=>{
                    if(ress){
                        res.status(201).json({message: "User registered"} );
                        connection.release();
                        //Sending an email to the student letting them know they are registered
                        transporter.sendMail(mailOptions, function(error){
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent to ' + req.body.student_number + ' using '+ req.body.email_address)
                            }
                        });
                    } 
                    if(err){
                        res.status(400).json({message:'Could not register the student.'});
                        connection.release();
                    }
                });
            } else {
                res.status(400).json({message:'You are already in the system.'});
                connection.release();
            }
        })
        .catch(function(err) {
            res.status(400).json({message:'Error has occured while registering the student.'});
            connection.release();
        });
    });
}
catch(error)
{
    res.status(500).json({message:'Error caught at Create student in api/routes/student.js.'});    
}

//Login Student
//This method is used to log in a student
//URL:  http://localhost:3000/student/login
//Requested data:       student_number
//                      password
//Data sent:            Token if the login was successful
//                      400 If the login was unsuccessful
try{
    router.post('/login',jsonParser,(req, res, next)=>{
        //Creating SQL variables for the Login Student
        var rstudent = 'SELECT * FROM student WHERE student_number = ?';

        //Creating variables for the data that was requested
        var studentNumber = req.body.student_number;
        var password = req.body.password;

        //Getting a connection to the MySQL database
        pool.getConnection()
        .then(function(connection) {
            var conn = connection;
            
            //Sending the query to the database and making a PROMISE
            return connection.query(rstudent, studentNumber);
        })
        .then(function(studentRows){
            //Creating the email that will be sent to the student when he logs in to the account
            var mailOptions = {
                from: 'selitnotifier@gmail.com',
                to: studentRows[0].Email_Address,
                subject: 'SELIT security',
                text: 'You have just logged Into your SELIT Account'
            };
            
            //Checking if the password the student provided matches the one in the database by decoding it
            var passwordmatch = bcrypt.compareSync(password, studentRows[0].Password);
            if(passwordmatch === false){
                res.status(401).json({message:'Wrong Password'});
                connection.release();
            }
            //If to test if the passwords match      
            if(passwordmatch == true)
            {
                //Sending the email to the student
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent to ' + req.body.student_number + ' using '+ studentRows[0].Email_Address);
                    }
                });

                //Creating a token for the user
                const tokenv = jwt.sign({
                    student_number: studentRows[0].Student_Number, 
                    student: studentRows[0].Student, 
                    admin: studentRows[0].Admin},
                    JWT_Organization,
                    {expiresIn: '1h'});             
                return res.status(200).json({body:tokenv});
                connection.release();
            }
            res.status(401).json({message:'Authentication failed'});
            connection.release();
        })
        .catch(function(err) {
            res.status(404).json({error:'Error occured with the login student sql statements.'});
            connection.release();
        });
    });
}
catch (error)
{
    res.status(500).json({message:'Error caught at Login student in api/routes/student.js.'});      
}

//Read Student
//This method is used to view all the students in the system
//URL: http://localhost:3000/student/getStudent
//Requested data:   Admin key in header
//Data sent:        JSON format to read all the students in the system
//                  400 If the read was unsuccessful
try{
    router.get('/getStudent', adminAuth, jsonParser, (req, res, next) => {
        //Creating variables to Read Student
        var rStudent = 'SELECT * FROM student_detail'
        //Getting a connection to the MySQL Database
        pool.getConnection().then((connection) => {
            //Sending the SQL query to the database
            connection.query(rStudent, (err, result) => {
                if (result){                    
                    res.status(200).json(result);
                    connection.release();
                }
                if (err){
                    res.status(400).json({message:'Could not read the students data from the database'});
                    connection.release();
                }
            });
        });     
    })
}
catch (error)
{
    res.status(500).json({message:'Error caught at Read student in api/routes/student.js.'});
}

//Make Student Admin
//This method is used to update/promote a student to administrator
//URL: http://localhost:3000/student/setStudentAdmin
//Requested data:   Admin key in header
//                  student_number
//Data sent:        200 If the update was successful
//                  400 If the update was unsuccessful
try{
    router.post('/setStudentAdmin', adminAuth, jsonParser, (req, res, next) => {
        //Creating variables to Update Student
        var uStudent = 'UPDATE Student SET Admin = 1 WHERE Student_Number = ?'
        //Getting a connection to the MySQL Database
        pool.getConnection().then((connection) => {
            //Sending the SQL query to the database
            connection.query(uStudent, req.body.student_number, (err, result) => {
                if (result){
                    console.log('Student was made an Admin.');
                    //Sending response
                    res.status(200).json(result);
                }
                if (err){
                    res.status(400).json({message:'Could not update the students data from the database'});
                }
            });
        });     
    })
}
catch (error)
{
    res.status(500).json({message:'Error caught at Read student in api/routes/student.js.'});
}


//Exporting all the different routes to app.js
module.exports = router;