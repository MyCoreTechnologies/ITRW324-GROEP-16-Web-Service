var JWT_Organization = 'mygeheim';
var jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
    console.log(req.headers);
    try{
        const decoded = jwt.verify(req.headers.authentication,JWT_Organization);
        if(decoded)
        {
            req.userData = decoded;
			const data = jwt.decode(req.headers.authentication);
			req.keystudentNumber = data.student_number;
			console.log(data.student_number);
			next();
        }
    }catch(error){
        return res.status(401).json({message:'Authorization failed'});
    }
};