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
            //If statement to check if the toke that was decoded has anmin authorization.
			if(data.admin === 1){
                next();
            } else {
                return res.status(401).json({message:'You are not authorized to do this.'});
            }
        }
    }catch(error){
        console.log('Failure in adminAuth.js');
        return res.status(401).json({message:'Authorization failed'});
    }
};