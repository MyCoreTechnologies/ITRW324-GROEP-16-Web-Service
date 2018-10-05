var JWT_Organization = 'mygeheim';
var jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
    console.log(req.headers);
    try{
        const decoded = jwt.verify(req.headers.authentication,JWT_Organization);
        req.userData = decoded;
	    next();
    }catch(error){
        return res.status(401).json({message:'Authorization failed'});
    }
};