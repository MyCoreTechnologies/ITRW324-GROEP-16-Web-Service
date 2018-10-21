//URL:  http://localhost:3000/author
//Author table/route needs the following:
//Admins that can create, read, update and delete data

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

//Create Author
//This post method will add a new author to the database
//URL:  http://localhost:3000/author/addAuthor
//Requested data:   Administrator key in header
//                  author_name
//Data sent:        200 If the adding was successful
//                  400 If the adding was unsuccessful
try{
    router.post('/addAuthor', adminAuth, jsonParser, (req, res, next) => {
        //Creating SQL variables for create author
        var iAuthor = 'INSERT INTO author set ?';
        
        //Creating Author object that needs to be added
        var author = {
            Author_Name:   req.body.author_name
        };

        //Getting a connection to the MySQL Database
        pool.getConnection().then((connection) => {
            //Sending the SQL query to the database
            connection.query(iAuthor, author, (err, result) => {
                if (result){
                    console.log('Data is being added');
                    res.status(200).json({message:'Author was added to the database'});
                }
                if (err){
                    res.status(400).json({message:'Could not insert the author data to the database'});
                }                
            });
        });
    });
}catch (error){
    res.status(500).json({message:'Error caught at Create Author in api/routes/author.js.'});
}

//Read Author
//This get method will return a list of all the authors in the system. 
//URL:  http://localhost:3000/author/getAuthor
//Requested data:   Administrator key in header
//Data sent:        JSON format of all authors
//                  400 If the adding was unsuccessful
try{
    router.get('/getAuthor', adminAuth, jsonParser, (req, res, next) => {
        //Creating the SQL variables to read author table
        var rAuthor = 'SELECT * FROM author';
        //Getting a connection to the MySQL Database
        pool.getConnection().then((connection) => {
            //Sending the SQL query to the database
            connection.query(rAuthor, (err, result) => {
                if (result){
                    console.log('Data is being collected.')
                    res.status(200).json(result);
                }
                if (err){
                    res.status(400).json({message:'Could not read the author data from the database'});
                }
            });
        });
    });
}catch (error){
    res.status(500).json({message:'Error caught at Read Author in api/routes/author.js.'});
}

//Update Author
//This get method will allow an administrator to update an author when it is needed. 
//URL:  http://localhost:3000/author/updateAuthor
//Requested Data: Administrator key in header
//                o_author_name ----Original author name to be updated
//                n_author_name ----New author name
//Data sent:        200 If the update was successful
//                  400 If the update was unsuccessful
try{
    router.post('/updateAuthor', adminAuth, jsonParser, (req, res, next) => {
        //Creating SQL variables to Update the author table
        var fAuthor = 'SELECT * FROM author WHERE author_name = ?';
        var uAuthor = 'UPDATE author SET author_name = ? WHERE author_name = ?';
        //Gettinig a connection to the MySQL database
        pool.getConnection()
        .then(function(conn) {
            connection = conn;
            //Sending the first query to the database and making a PROMISE
            return connection.query(fAuthor, req.body.o_author_name);
        })
        .then(function(authorRow){
            //If function to test if the data you want to update exists in the database
            if(authorRow.length === 0)
            {
                res.status(400).json({message:'Author does not exist in databse'});
            } else {
                //Sending the update query to the databse with the old and new values
                connection.query(uAuthor, [req.body.n_author_name, req.body.o_author_name], (err, result) => {
                    if(result){
                        console.log('Updating author table.')
                        res.status(200).json({message:'Author was updated'});
                    }
                    if (err){
                        res.status(400).json({message:'Author could not be updated'});;
                    }
                })
            }
        })
    });
}catch (error){
    res.status(500).json({message:'Error caught at Update Author in api/routes/author.js.'});
}

//Delete Author
//This method will allow an administator to delete an author
//URL:  http://localhost:3000/author/deleteAuthor
//NOTE:Admins can only remove Authors not Attached to any books.
//Requested data:  Administrator key in header
//                 author_name
//Data sent:        200 If the delete was successful
//                  400 If the delete was unsuccessful
try{
    router.post('/deleteAuthor', adminAuth, jsonParser, (req, res, next) => {
        //Creating SQL variables to delete an author
        var fAuthor = 'SELECT * FROM author WHERE author_name = ?';
        var dAuthor = 'DELETE FROM author where author_number = ?';
        //Getting a connection to MySQL database
        pool.getConnection()
        .then(function(conn) {
            connection = conn;
            //Sending first SQL query to the database and making a PROMISE
            return connection.query(fAuthor, req.body.author_name);
        })
        .then(function(authorRow){
            //If function to test if the data you want to delete exists in the database
            if(authorRow.length === 0)
            {
                res.status(400).json({message:'Author does not exist in databse'});
            } else {
                //Sending the second SQL theory to delete the author
                connection.query(dAuthor, authorRow[0].Author_Number, (err, result, fields) => {
                    if(result){
                        console.log('Deleting Author');
                        res.status(200).json({message:'Author was removed'});
                    }
                    if (err){
                        res.status(400).json({message:'Author was not deleted.'});
                    }
                })
            }            
        })
    });
}catch (error){
    res.status(500).json({message:'Error caught at Delete Author in api/routes/author.js.'});
}

//Exporting all the different routes to app.js
module.exports = router;