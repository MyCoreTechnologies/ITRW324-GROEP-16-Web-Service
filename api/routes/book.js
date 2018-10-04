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

//Methods for adding a book
try{
    router.post('/addBook', jsonParser, (req, res) => {
        var ibook = 'INSERT INTO book set ?';
        var iauthor = 'INSERT INTO author set ?';
        var ibookauthor = 'INSERT INTO book_author set ?';
        var ibooksubject = 'INSERT INTO book_subject set ?';
        var fbook = 'SELECT * FROM book WHERE Book_Name = ? AND Book_Edition = ? AND Book_ISBN_10_Number = ? AND Book_ISBN_13_Number = ? AND Book_Price = ? AND Book_Type = ? AND Date_Placed = ? AND STUDENT_Student_Number = ?';
        var fauthor = 'SELECT * FROM author WHERE Author_Name = ?';
        var fsubject = 'SELECT * FROM subject WHERE Subject_Code = ?';
        var ffaculty = 'SELECT * FROM faculty WHERE Faculty_Name = ?';
        var fbookauthor = 'SELECT * FROM book_author WHERE BOOK_Book_Number = ? AND AUTHOR_Author_Number = ?';
        var fbooksubject = 'SELECT * FROM book_subject WHERE BOOK_Book_Number = ? AND SUBJECT_Subject_Number = ?';
        var ffaculty = 'SELECT * FROM faculty WHERE Faculty_Name = ?';
    
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
    
        pool.getConnection()
        .then(function(conn) {
            connection = conn;
            return connection.query(fbook, [req.body.book_name, req.body.book_edition, req.body.book_isbn_10_number, req.body.book_isbn_13_number, req.body.book_price, req.body.book_type, req.body.date_placed, req.body.student_number]);
        })
        .then(function(bookRow){
            if(bookRow.length === 0)
            {
                connection.query(ibook, book, (err, result) => {
                    if (err){
                        res.status(400).json({message:'Could not add Book'});
                    }
                    if (result){
                        console.log('Book added');
                    }
                });
            }
            return connection.query(fbook, [req.body.book_name, req.body.book_edition, req.body.book_isbn_10_number, req.body.book_isbn_13_number, req.body.book_price, req.body.book_type, req.body.date_placed, req.body.student_number]);
        })
        .then(function(booksRow){
            if(booksRow.length === 0)
            {
                res.status(400).json({message:'Books system empty'});
            } else {
                book_number = booksRow[0].Book_Number;
                console.log('Book read');
            }
            return connection.query(ffaculty, req.body.faculty_name);
        })
        .then(function(facultyRow){
            if(facultyRow.length === 0)
            {
                res.status(400).json({message:'Faculty does not exist'});
            } else {
                if(facultyRow[0].Faculty_Name === req.body.faculty_name)
                {
                    faculty_number = facultyRow[0].Faculty_Number;
                    console.log('Faculty read');
                }
            }
            return connection.query(fsubject, req.body.subject_code);
        })
        .then(function(subjectRow){
            if(subjectRow.length === 0)
            {
                res.status(400).json({message:'Subject does not exist'});
            } else{
                if(subjectRow[0].Subject_Code === req.body.subject_code)
                {
                    subject_number = subjectRow[0].Subject_Number;
                    console.log('Subject read');
                }
            return connection.query(fauthor, req.body.author_name);
            }
        })
        .then(function(authorRow){
            if(authorRow.length === 0)
            {
                connection.query(iauthor, author, (err, result, fields) => {
                    if (err){
                        res.status(400).json({message:'Author was not added'});;
                    }
                    if (result){
                        console.log('Author added');
                    }
                    })
            }
            return connection.query(fauthor, req.body.author_name);
        })
        .then(function(authorsRow){
            if(authorsRow.length === 0)
            {
                console.log('Author table is empty');
            } else {
                if(authorsRow[0].Author_Name === req.body.author_name)
                {
                    author_number = authorsRow[0].Author_Number;
                    console.log('Author read');
                }
            }
            return connection.query(fbookauthor, [book_number, author_number]);
        })
        .then(function(bookauthorRow){
            if(bookauthorRow.length === 0){
                var book_author = {
                    AUTHOR_Author_Number:       author_number,
                    BOOK_Book_Number:           book_number
                }
                connection.query(ibookauthor, book_author, (err, result) => {
                    if (err){
                        res.status(400);
                    }
                    if (result){
                        console.log('Book_Author added to database');
                    }
                });
            } else{
                console.log('Book_Author found');
            }
            return connection.query(fbooksubject, [book_number, subject_number]);
        })
        .then(function(booksubjectRow){
            if(booksubjectRow.length === 0){
                var book_subject = {
                    SUBJECT_Subject_Number:     subject_number,
                    BOOK_Book_Number:           book_number
                }
                connection.query(ibooksubject, book_subject, (err, result) => {
                    if (err){
                        res.status(400);
                    }
                    if (result){
                        console.log('Book_Subject added to database');
                    }
                });           
            } else{
                console.log('Book_Subject found');
            }
        })
        .then(function(nothing){
            res.status(200).json({message:'The Book was added to the database.'});
        })
        .catch(function(err) {
            console.log(err);
                res.status(404).json({error:'Error occured with the database sql statements.'});
        });
    });
}
catch(error)
{
    res.status(404).json({error:'An error occured when we tried to add your book.'});
}

//Methods for viewing all book data
try{
    router.get('/viewbooks', jsonParser, (req, res) => {
        var viewBookSQL = 'SELECT * FROM book_detail'

        pool.getConnection().then((connection) => {
            connection.query(viewBookSQL, (err, result) => {
                if (err){
                    res.status(400).json({message:'Data could not be found.'});
                }
                if (result){
                    console.log('Data being collected.');
                    res.status(200).json(result);
                }
            });
        });
    });
}
catch(error)
{
    res.status(404).json({error:'An error occured when we tried to add your book.'});
}

try{
    router.post('/mybooks', jsonParser, (req, res) => {
        var viewBookSQL = 'SELECT * FROM book_detail where STUDENT_Student_Number = ?'

        pool.getConnection().then((connection) => {
            connection.query(viewBookSQL, req.body.student_number, (err, result) => {
                if (err){
                    res.status(400).json({message:'Data could not be found.'});
                }
                if (result){
                    console.log('Data being collected.');
                    res.status(200).json(result);
                }
            });
        });
    });
}
catch(error)
{
    res.status(404).json({error:'An error occured when we tried to add your book.'});
}

module.exports = router;
