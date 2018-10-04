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
    var ibook = 'INSERT INTO book set ?';
    var iauthor = 'INSERT INTO author set ?';
    var fbook = 'SELECT * FROM book WHERE Book_Name = ? AND Book_Edition = ? AND Book_ISBN_10_Number = ? AND Book_ISBN_13_Number = ? AND Book_Price = ? AND Book_Type = ? AND Date_Placed = ? AND STUDENT_Student_Number = ?';
    var fauthor = 'SELECT * FROM author WHERE Author_Name = ?';
    var fsubject = 'SELECT * FROM subject WHERE Subject_Code = ?';
    var ffaculty = 'SELECT * FROM faculty WHERE Faculty_Name = ?';
    var ibookauthor = 'INSERT INTO book_author set ?';
    var ibooksubject = 'INSERT INTO book_subject set ?';

    var faculty_number;
    var subject_number;
    var author_number;
    var book_number;

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

    var author = {
        Author_Name:   req.body.author_name
    };

    pool.getConnection().then((connection) => {
        connection.query(ibook, book, (err, result, fields) => {
            if (err){
                res.status(400);
            }
            if (result){
                console.log('Book added');
            }
        });
    });

    pool.getConnection()
    .then(function(conn) {
        connection = conn;
        return connection.query(fbook, [req.body.book_name, req.body.book_edition, req.body.book_isbn_10_number, req.body.book_isbn_13_number, req.body.book_price, req.body.book_type, req.body.date_placed, req.body.student_number], (err, result, fields));
    })
    .then(function(bookRow){
        if(result.length === 0)
        {
            res.status(400).json({message:'Book does not exist'});
        } else {
            book_number = bookRow[0].Book_Number;
            console.log('Book read');
            return connection.query(ffaculty, req.body.faculty_name, (err, result, fields));
        }
    })
    .then(function(facultyRow){
        if(result.length === 0)
        {
            res.status(400).json({message:'Faculty does not exist'});
        } else {
            if(facultyRow[0].Faculty_Name === req.body.faculty_name)
            {
                faculty_number = facultyRow[0].Faculty_Number;
                console.log('Faculty read');
            }
        }
        return connection.query(fsubject, req.body.subject_code, (err, result, fields));
    })
    .then(function(subjectRow){
        if(result.length === 0)
        {
            res.status(400).json({message:'Subject does not exist'});
        } else{
            if(subjectRow[0].Subject_Code === req.body.subject_code)
            {
                subject_number = subjectRow[0].Subject_Number;
                console.log('Subject read');
            }
        return connection.query(fauthor, req.body.author_name, (err, result, fields));
        }
    })
    .then(function(authorRow){
        if(result.length === 0)
        {
            console.log('Author table was empty');
        } else{
            if(authorRow[0].Author_Name !== req.body.author_name)
            {
                connection.query(iauthor, author, (err, result, fields) => {
                if (err){
                    res.status(400);
                }
                if (result){
                    console.log('Author added');
                }
                })
            }
        }
        return connection.query(fauthor, req.body.author_name, (err, result, fields));
    })
    .then(function(authorsRow){
        if(result.length === 0)
        {
            console.log('Author table was empty');
        } else {
            if(authorsRow[0].Author_Name === req.body.author_name)
            {
                author_number = authorsRow[0].Author_Number;
                console.log('Author read');
            }
        }
    });
    
    var book_author = {
        AUTHOR_Author_Number:       author_number,
        BOOK_Book_Number:           book_number
    }

    var book_subject = {
        SUBJECT_Subject_Number:     subject_number,
        BOOK_Book_Number:           book_number
    }

    pool.getConnection().then((connection) => {
        connection.query(ibookauthor, book_author, (err, result, fields) => {
            if (err){
                res.status(400);
            }
            if (result){
                console.log('Book_Author added');
            }
        });

        connection.query(ibooksubject, book_subject, (err, result, fields) => {
            if (err){
                res.status(400);
            }
            if (result){
                console.log('Book_Subject added');
            }
        });
    });
});

module.exports = router;
