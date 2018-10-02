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

router.post('/addStudentOffence', jsonParser, (req, res, next) => {
    var sql = 'INSERT INTO student_offence set ?';

    var offence = {
        Reason:             req.body.reason,
        Type_Of_Offence:    req.body.type_of_offence,
        Date_Of_Offence:    req.body.date_of_offence
    };

    pool.getConnection().then((connection) => {
        connection.query(sql, offence, (err, result, fields) => {
            if (err){
                res.status(400);
            }
            if (result){
                res.status(200).json({message:'Offence added'});
            }
        });
    });
});

module.exports = router;
