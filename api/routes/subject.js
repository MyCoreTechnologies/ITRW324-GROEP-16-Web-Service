//URL:  http://localhost:3000/subject
//Subject table/route needs the following:
//Admin can create, read
//Creation of a subject is only needed when the university adds new subjects
//Delete will not be used since we keep history of all subjects

//Constant variables and variables for all used api's and directories
const express = require('express');
const router = express.Router();
const mysql = require('promise-mysql');
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

//Create Subject
//This method is used to add a subject to the system
//URL:  http://localhost:3000/subject/addSubject
//Requested data:   Admin Key in header
//                  subject_code
//                  subject_name
//                  faculty_name
//Data sent:        200 If the creation was successful
//                  400 If the creation was unsuccessful
try{
    router.post('/addSubject', adminAuth, jsonParser, (req, res, next) => {
        //Creating SQL variables for the Create Subject
        var iSubject = 'INSERT INTO subject set ?';
        var rSubject = 'SELECT * FROM subject WHERE subject_code = ?';
        var rFaculty = 'SELECT * FROM faculty WHERE faculty_name = ?';

        //Creating variables for the data that was not requested
        var facultyNumber;

        //Getting a connection to the MySQL database
        pool.getConnection()
        .then(function(conn) {
            connection = conn;
            //Sending the first query to the database and making a PROMISE
            return connection.query(rFaculty, req.body.faculty_name);
        })
        .then(function(facultyRow){
            //If statement to test if the data you are looking for exist.
            if(facultyRow.length === 0){
                res.status(400).json({message:'Faculty does not exist.'});
                connection.release();
            } else {
                facultyNumber = facultyRow[0].Faculty_Number;
            }
            return connection.query(rSubject, req.body.subject_code);
        })
        .then(function(subjectRow){
            //If statement to test if the data you are looking for exist.
            if(subjectRow.length === 0){
                //Creating province object
                var subject = {
                    Subject_Code:       req.body.subject_code,
                    Subject_Name:       req.body.subject_name,
                    FACULTY_Faculty_Number:     facultyNumber
                 };

                //Sending a SQL query to the database
                connection.query(iSubject, subject, (err, result) => {
                    if (result){
                        res.status(200).json({message:'Subject added'});
                        connection.release();
                    }
                    if (err){
                        res.status(400).json({message:'Subject could not be added.'});
                        connection.release();
                    }            
                });
            } else {
                res.status(400).json({message:'Subject already exist.'});
                connection.release();
            }
        })
        .catch(function(err){
            res.status(400).json({message:'Something went wrong when we tried to insert the subject.'});
            connection.release();
        });            
    });
}
catch(error)
{
    res.status(500).json({message:'Error caught at Create Subject in api/routes/subject.js.'});
}

//Read Subject
//This method is used to read all the subjects in the system
//URL:  http://localhost:3000/subject/getSubject
//Requested data:   Administrator key in header
//Data sent:        JSON format of all the subjects in the system
//                  400 If the read was unsuccessful
try{
    router.get('/getSubject', adminAuth, jsonParser, (req, res, next) => {
        //Creating the SQL variables to read subject table
        var rSubject = 'SELECT * FROM subject';
        //Getting a connection to the MySQL Database
        pool.getConnection().then((connection) => {
            //Sending the SQL query to the database
            connection.query(rSubject, (err, result) => {
                if (result){
                    res.status(200).json(result);
                    connection.release();
                }
                if (err){
                    res.status(400).json({message:'Could not read the subject data from the database'});
                    connection.release();
                }
            });
        });
    });
}catch (error){
    res.status(500).json({message:'Error caught at Read Subject in api/routes/subject.js.'});
}

//Exporting all the different routes to app.js
module.exports = router;