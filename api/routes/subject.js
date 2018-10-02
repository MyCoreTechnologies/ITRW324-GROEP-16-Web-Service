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

router.post('/addSubject', jsonParser, (req, res, next) => {
    var sql = 'INSERT INTO subject set ?';

    var subject = {
        Subject_Code:               req.body.subject_code,
        Subject_Name:               req.body.subject_name,
        FACULTY_Faculty_Number:     req.body.faculty_number
    };

    pool.getConnection().then((connection) => {
        connection.query(sql, subject, (err, result, fields) => {
            if (err){
                res.status(400);
            }
            if (result){
                res.status(200).json({message:'Subject added'});
            }
        });
    });
});

module.exports = router;
