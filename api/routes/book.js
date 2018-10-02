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

router.post('/addBook', jsonParser, (req, res, next) => {
    var sql = 'INSERT INTO book set ?';

    var book = {
        Book_Name:                  req.body.book_name,
        Book_Edition:               req.body.book_edition,
        Book_ISBN_10_Number:        req.body.book_isbn_10_number,
        Book_ISBN_13_Number:        req.body.book_isbn_13_number,
        Book_Price:                 req.body.book_price,
        Book_Type:                  req.body.book_type,
        Date_Placed:                req.body.date_placed,
        STUDENT_Student_Number:     req.body.student_number
    };

    pool.getConnection().then((connection) => {
        connection.query(sql, book, (err, result, fields) => {
            if (err){
                res.status(400);
            }
            if (result){
                res.status(200).json({message:'Book added'});
            }
        });
    });
});

module.exports = router;
