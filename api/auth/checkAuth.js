var JWT_private = 'secret';
var jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
    console.log(req.headers);
    try{
        const decoded = jwt.verify(req.headers.authentication,JWT_private);
        req.userData = decoded;
	    next();
    }catch(error){
        return res.status(401).json({message:'Authorization failed'});
    }
};