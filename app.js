//Console.log to say the app.js file has started
console.log('App.js has started');

//Constant Variables created for imported API's
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

//local packages and branches that is used
app.use(morgan('dev'));

//Setting up the paths for the routes I created.
const authorRoute = require('./api/routes/author.js');
const bookRoute = require('./api/routes/book.js');
const facultyRoute = require('./api/routes/faculty.js');
const hostelRoute = require('./api/routes/hostel.js');
const provinceRoute = require('./api/routes/province.js');
const student_offenceRoute = require('./api/routes/student_offence.js');
const studentRoute = require('./api/routes/student.js');
const subjectRoute = require('./api/routes/subject.js');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Setting the CORS the Web-Service will allow
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS')
    {
        res.header('Access-Control-Allow-Methods','GET, PUT, POST, DELETE, PATCH, OPTIONS');
        return res.status(200).json({});
    }
    next();
});

//Setting the URL extensions for the Routes that i created.
app.use('/author', authorRoute);
app.use('/book', bookRoute);
app.use('/faculty', facultyRoute);
app.use('/hostel', hostelRoute);
app.use('/province', provinceRoute);
app.use('/student_offence', student_offenceRoute);
app.use('/student', studentRoute);
app.use('/subject', subjectRoute);

//Exporting the app so server.js can access and use the routes.
module.exports = app;