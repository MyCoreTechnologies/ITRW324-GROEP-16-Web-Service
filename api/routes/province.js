//URL:  http://localhost:3000/province
//Province table/route needs the following:
//Admin can create, read, update
//Creation of a province is only needed when we want to add a province from another country
//Province cannot be deleted due to the ammount of students linked to each province

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

//Create Province
//URL:  http://localhost:3000/province/addProvince
//Requested data: Admin Key in header
//                province_name
try{
    router.post('/addProvince', adminAuth, jsonParser, (req, res, next) => {
        //Creating SQL variables for the Create Province
        var iProvince = 'INSERT INTO province set ?';

        //Creating province object
        var province = {
            Province_Name:   req.body.province_name
        };

        //Getting a connection to the MySQL database
        pool.getConnection().then((connection) => {
            //Sending SQL query to the database
            connection.query(iProvince, province, (err, result) => {
                if (result){
                    res.status(200).json({message:'Province added'});
                }
                if (err){
                    res.status(400).json({message:'Province could not be added.'});
                }            
            });
        });
    });
}
catch(error)
{
    res.status(500).json({message:'Error caught at Create Province in api/routes/province.js.'});
}

//Read Province
//URL:  http://localhost:3000/province/getProvince
//Requested data: Admin Key in header
try{
    router.get('/getProvince', adminAuth, jsonParser, (req, res, next) => {
        //Creating SQL variables for the Read Province
        var rProvince = 'SELECT * FROM province';

        //Getting a connection to the MySQL database
        pool.getConnection().then((connection) => {
            //Sending SQL query to the database
            connection.query(rProvince, (err, result) => {
                if (result){
                    console.log('Data is being collected.');
                    res.status(200).json(result);
                }
                if (err){
                    res.status(400).json({message:'Could not retrieve province data.'});
                }            
            });
        });
    });
}
catch(error)
{
    res.status(500).json({message:'Error caught at Read Province in api/routes/province.js.'});
}

//Update Province
//URL:  http://localhost:3000/province/updateProvince
//Requested Data: Administrator key in header
//                o_province_name ----Original province name to be updated
//                n_province_name ----New province name
try{
    router.post('/updateProvince', adminAuth, jsonParser, (req, res, next) => {
        //Creating SQL variables to Update the province table
        var fProvince = 'SELECT * FROM province WHERE province_name = ?';
        var uProvince = 'UPDATE province SET province_name = ? WHERE province_name = ?';
        //Gettinig a connection to the MySQL database
        pool.getConnection()
        .then(function(conn) {
            connection = conn;
            //Sending the first query to the database and making a PROMISE
            return connection.query(fProvince, req.body.o_province_name);
        })
        .then(function(provinceRow){
            //If function to test if the data you want to update exists in the database
            if(provinceRow.length === 0)
            {
                res.status(400).json({message:'Province does not exist in databse'});
            } else {
                //Sending the update query to the databse with the old and new values
                connection.query(uProvince, [req.body.n_province_name, req.body.o_province_name], (err, result) => {
                    if(result){
                        console.log('Updating province table.')
                        res.status(200).json({message:'Province was updated'});
                    }
                    if (err){
                        res.status(400).json({message:'Province could not be updated'});;
                    }
                })
            }
        })
    });
}catch (error){
    res.status(500).json({message:'Error caught at Update Province in api/routes/province.js.'});
}

//Exporting all the different routes to app.js
module.exports = router;