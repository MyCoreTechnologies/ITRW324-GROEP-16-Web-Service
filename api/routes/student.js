const express = require('express');
const router = express.Router();
const mysql = require('promise-mysql');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "ITRW324",
    database: 'selit_database'
});

router.post('/registerStudent', jsonParser, (req, res, next) => {
    var sql = 'INSERT INTO student set ?';

    var student = {
        Student_Number:                     req.body.student_number,
        First_Name:                         req.body.first_name,
        Last_Name:                          req.body.last_name,
        Contact_Number:                     req.body.contact_number,
        Email_Address:                      req.body.email_address,
        Password:                           req.body.password,
        PROVINCE_Province_Number:           req.body.province_number,
        HOSTEL_Hostel_Number:               req.body.hostel_number,
        STUDENT_OFFENCE_Offence_Number:     req.body.offence_number
    };

    pool.getConnection().then((connection) => {
        connection.query(sql, student, (err, result, fields) => {
            if (err){
                res.status(400);
            }
            if (result){
                res.status(200).json({message:'Student registered'});
            }
        });
    });
});

module.exports = router;