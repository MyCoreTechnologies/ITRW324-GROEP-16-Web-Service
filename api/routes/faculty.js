//URL:  http://localhost:3000/faculty
//Faculty table/route needs the following:
//Admin can create, read, update
//Creation of a faculty is only in extreme rare cases where the university adds a new faculty
//Faculty cannot be deleted due to the amount of subjects linked to each faculty

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

//Create Faculty
//This method is used to add a facility to the system
//URL:  http://localhost:3000/faculty/addFaculty
//Requested data:   Admin Key in header
//                  faculty_name
//Data sent:        200 If the adding was successful
//                  400 If the adding was unsuccessful
try{
    router.post('/addFaculty', adminAuth, jsonParser, (req, res, next) => {
        //Creating SQL variables for the Create Faculty
        var iFaculty = 'INSERT INTO faculty set ?';

        //Creating faculty object
        var faculty = {
            Faculty_Name:   req.body.faculty_name
        };

        //Getting a connection to the MySQL database
        pool.getConnection().then((connection) => {
            //Sending SQL query to the database
            connection.query(iFaculty, faculty, (err, result, fields) => {
                if (result){
                    res.status(200).json({message:'Faculy added'});
                    connection.release();                    
                }
                if (err){
                    res.status(400).json({message:'Faculy could not be added.'});
                    connection.release();
                }            
            });
        });
    });
}
catch(error)
{
    res.status(500).json({message:'Error caught at Create Faculy in api/routes/faculty.js.'});
}

//Read Faculty
//This method is used to display all the facilities in the system
//URL:  http://localhost:3000/faculty/getFaculty
//Requested data:   Admin Key in header
//Data sent:        JSON format of all the faculities in the system 
//                  400 If the reading was unsuccessful
try{
    router.get('/getFaculty', adminAuth, jsonParser, (req, res, next) => {
        //Creating SQL variables for the Read Faculty
        var rFaculty = 'SELECT * FROM faculty';

        //Getting a connection to the MySQL database
        pool.getConnection().then((connection) => {
            //Sending SQL query to the database
            connection.query(rFaculty, (err, result) => {
                if (result){
                    res.status(200).json(result);
                    connection.release();
                }
                if (err){
                    res.status(400).json({message:'Could not retrieve faculty data.'});
                    connection.release();
                }            
            });
        });
    });
}
catch(error)
{
    res.status(500).json({message:'Error caught at Read Faculy in api/routes/faculty.js.'});
}

//Update Faculty
//This method is used to update a system when its needed
//URL:  http://localhost:3000/faculty/updateFaculty
//Requested Data:   Administrator key in header
//                  o_faculty_name ----Original faculty name to be updated
//                  n_faculty_name ----New faculty name
//Data sent:        200 If the update was successful
//                  400 If the update was unsuccessful
try{
    router.post('/updateFaculty', adminAuth, jsonParser, (req, res, next) => {
        //Creating SQL variables to Update the author table
        var fFaculty = 'SELECT * FROM faculty WHERE faculty_name = ?';
        var uFaculty = 'UPDATE faculty SET faculty_name = ? WHERE faculty_name = ?';
        //Gettinig a connection to the MySQL database
        pool.getConnection()
        .then(function(conn) {
            connection = conn;
            //Sending the first query to the database and making a PROMISE
            return connection.query(fFaculty, req.body.o_faculty_name);
        })
        .then(function(facultyRow){
            //If function to test if the data you want to update exists in the database
            if(facultyRow.length === 0)
            {
                res.status(400).json({message:'Faculty does not exist in databse'});
                connection.release();
            } else {
                //Sending the update query to the databse with the old and new values
                connection.query(uFaculty, [req.body.n_faculty_name, req.body.o_faculty_name], (err, result) => {
                    if(result){
                        console.log('Updating faculty table.')
                        res.status(200).json({message:'Faculty was updated'});
                        connection.release();
                    }
                    if (err){
                        res.status(400).json({message:'Faculty could not be updated'});;
                        connection.release();
                    }
                })
            }
        })
    });
}catch (error){
    res.status(500).json({message:'Error caught at Update Faculty in api/routes/faculty.js.'});
}

//Exporting all the different routes to app.js
module.exports = router;