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

router.post('/addHostel', jsonParser, (req, res, next) => {
    var sql = 'INSERT INTO hostel set ?';

    var hostel = {
        Hostel_Name:    req.body.hostel_name
    };

    pool.getConnection().then((connection) => {
        connection.query(sql, hostel, (err, result, fields) => {
            if (err){
                res.status(400);
            }
            if (result){
                res.status(200).json({message:'Hostel added'});
            }
        });
    });
});

module.exports = router;