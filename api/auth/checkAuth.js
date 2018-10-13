var JWT_Organization = 'mygeheim';
var jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{   
    try{
        const decoded = jwt.verify(req.headers.authorization,JWT_Organization);
        if(decoded)
        {
            req.userData = decoded;
			const data = jwt.decode(req.headers.authorization);
			req.keystudentNumber = data.student_number;
			next();
        }
    }catch(error){
        return res.status(401).json({message:'Authorization failed'});
    }
};