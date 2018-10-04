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

router.post('/addAuthor', jsonParser, (req, res, next) => {
    if(req.adminYN === 1){
        var sql = 'INSERT INTO author set ?';

        var author = {
            Author_Name:   req.body.author_name
        };

        pool.getConnection().then((connection) => {
            connection.query(sql, author, (err, result, fields) => {
                if (err){
                    res.status(400);
                }
                if (result){
                    res.status(200).json({message:'Author added'});
                }
            });
        });
    }
});

module.exports = router;
