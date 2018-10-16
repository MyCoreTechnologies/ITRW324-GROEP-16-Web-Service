//URL:  http://localhost:3000/student_offence
//Student_Offence table/route needs the following:
//Admin can create, read, update and delete
//Student can create

//Constant variables and variables for all used api's and directories
const express = require('express');
const router = express.Router();
const mysql = require('promise-mysql');
const nodemailer = require('nodemailer');
const checkAuth = require("../auth/checkAuth");
const adminAuth = require("../auth/adminAuth");
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

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

//Create Student Offence
//URL:  http://localhost:3000/student_offence/reportOffence
//Requested data: Key in header
//                student_number
//                reason
//                type_of_offence ---- default Reported
//                date_of_offence
try{
    router.post('/reportOffence', checkAuth, jsonParser, (req, res, next) => {
        console.log(req.body);
        //Creating SQL variables for the Create Subject
        var iStudentOffence = 'INSERT INTO `selit_database`.`student_offence` set ?';

        //Creating offence object
        var offence = {
            Reason:                     req.body.reason,
            Type_Of_Offence:            req.body.type_of_offence,
            Date_Of_Offence:            req.body.date_of_offence,
            STUDENT_Student_Number:     req.body.student_number 
        }

        //Getting a connection to the MySQL database
        pool.getConnection().then((connection) => {
            //Sending SQL query to the database
            connection.query(iStudentOffence, offence, (err, result, fields) => {
                if (result){
                    connection.query('SELECT Email_Address FROM student WHERE Student_Number = ?', req.body.student_number, (ers, resu) =>{
                        if(resu){
                        //Creating email for the student notifying them of the report
                        var mailOptions = {
                            from: 'selitnotifier@gmail.com',
                            to: resu[0].Email_Address,
                            subject: 'SELIT security',
                            text: 'You have just been reported for ' + req.body.reason + '.'
                        };

                        //Sending the email to the student
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent to '+ resu[0].Email_Address);
                            }
                        });
                        }
                        if(ers) {
                            res.status(400).json({message:'Student not found.'});
                        }
                    })   
                    res.status(200).json({message:'Student was reported added'});
                }
                if (err){
                    res.status(400).json({message:'Student could not be reported.'});
                }            
            });
        });

    })                 
}
catch(error)
{
    res.status(500).json({message:'Error caught at Create Student Offence in api/routes/student_offence.js.'});
}

//Read Student Offence
//URL:  http://localhost:3000/student_offence/getOffence
//Requested data: Administrator key in header
try{
    router.get('/getOffence', adminAuth, jsonParser, (req, res, next) => {
        //Creating the SQL variables to read student offence table
        var rOffence = 'SELECT * FROM student_offence';
        //Getting a connection to the MySQL Database
        pool.getConnection().then((connection) => {
            //Sending the SQL query to the database
            connection.query(rOffence, (err, result) => {
                if (result){
                    console.log('Data is being collected.')
                    res.status(200).json(result);
                }
                if (err){
                    res.status(400).json({message:'Could not read the offence data from the database'});
                }
            });
        });
    });
}catch (error){
    res.status(500).json({message:'Error caught at Read Student Offence in api/routes/student_offence.js.'});
}

//Update Upgrade Student_Offence
//URL:  http://localhost:3000/student_offence/upgradeOffence
//Requested Data: Administrator key in header
//                offence_number
//                type_of_offence ----New type of offence
try{
    router.post('/upgradeOffence', adminAuth, jsonParser, (req, res, next) => {
        //Creating SQL variables to Update the author table
        var fStudentOffence = 'SELECT * FROM student_offence WHERE offence_number = ?';
        var uStudentOffence = 'UPDATE student_offence SET type_of_offence = ? WHERE offence_number = ?';
        //Gettinig a connection to the MySQL database
        pool.getConnection()
        .then(function(conn) {
            connection = conn;
            //Sending the first query to the database and making a PROMISE
            return connection.query(fStudentOffence, req.body.offence_number);
        })
        .then(function(offenceRow){
            //If function to test if the data you want to update exists in the database
            if(offenceRow.length === 0)
            {
                res.status(400).json({message:'Offence does not exist in databse'});
            } else {
                //Sending the update query to the databse with the old and new values
                connection.query(uStudentOffence, [req.body.type_of_offence, req.body.offence_number], (err, result) => {
                    if(result){
                        console.log('Updating Student_Offence table.')
                        res.status(200).json({message:'Student_Offence was updated'});
                    }
                    if (err){
                        res.status(400).json({message:'Student_Offence could not be updated'});;
                    }
                })
            }
        })
    });
}catch (error){
    res.status(500).json({message:'Error caught at Update Upgrade Student_Offence in api/routes/student_offence.js.'});
}

//Delete Student_Offence
//URL:  http://localhost:3000/student_offence/deleteOffence
//Requested Data: Administrator key in header
//                offence_number
try{
    router.post('/deleteOffence', adminAuth, jsonParser, (req, res, next) => {
        //Creating SQL variables to Update the author table
        var fStudentOffence = 'SELECT * FROM student_offence WHERE offence_number = ?';
        var dStudentOffence = 'DELETE FROM student_offence WHERE offence_number = ?';
        //Gettinig a connection to the MySQL database
        pool.getConnection()
        .then(function(conn) {
            connection = conn;
            //Sending the first query to the database and making a PROMISE
            return connection.query(fStudentOffence, req.body.offence_number);
        })
        .then(function(offenceRow){
            //If function to test if the data you want to update exists in the database
            if(offenceRow.length === 0)
            {
                res.status(400).json({message:'Offence does not exist in databse'});
            } else {
                //Sending the update query to the databse with the old and new values
                connection.query(dStudentOffence, req.body.offence_number, (err, result) => {
                    if(result){
                        console.log('Deleteing Student Offence .')
                        res.status(200).json({message:'Student_Offence was deleted'});
                    }
                    if (err){
                        res.status(400).json({message:'Student_Offence could not be deleted'});;
                    }
                })
            }
        })
    });
}catch (error){
    res.status(500).json({message:'Error caught at Delete Student_Offence in api/routes/student_offence.js.'});
}

//Exporting all the different routes to app.js
module.exports = router;