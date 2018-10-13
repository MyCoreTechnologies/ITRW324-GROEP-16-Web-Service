console.log('App has started');

const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

//local packages/branches
app.use(morgan('dev'));

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

app.use('/author', authorRoute);
app.use('/book', bookRoute);
app.use('/faculty', facultyRoute);
app.use('/hostel', hostelRoute);
app.use('/province', provinceRoute);
app.use('/student_offence', student_offenceRoute);
app.use('/student', studentRoute);
app.use('/subject', subjectRoute);

module.exports = app;