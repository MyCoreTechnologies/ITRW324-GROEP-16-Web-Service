//This file is used to check the token recieved by a request and check if the user who made the request has administrator rights

//Creation of variables to set the API's used
var jwt = require('jsonwebtoken');
var JWT_Organization = 'mygeheim';

module.exports = (req,res,next)=>{   
    try{
        //Variable to set the decoded token information to test it
        const decoded = jwt.verify(req.headers.authorization,JWT_Organization);
        if(decoded)
        {
            req.userData = decoded;
            const data = jwt.decode(req.headers.authorization);
            //Setting the student number that is found in the header to a variable that can be used without decoding it each time.
			req.keystudentNumber = data.student_number;
			next();
        }
    }catch(error){
        return res.status(401).json({message:'Authorization failed'});
    }
};