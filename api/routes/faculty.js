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

router.post('/addFaculy', jsonParser, (req, res, next) => {
    var sql = 'INSERT INTO faculy set ?';

    var faculty = {
        Faculty_Name:   req.body.faculty_name
    };

    pool.getConnection().then((connection) => {
        connection.query(sql, faculty, (err, result, fields) => {
            if (err){
                res.status(400);
            }
            if (result){
                res.status(200).json({message:'Faculy added'});
            }
        });
    });
});

module.exports = router;
