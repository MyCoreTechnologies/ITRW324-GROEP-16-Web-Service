var JWT_Organization = 'mygeheim';
var jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
    try{
        // console.log(req.headers.authorization);
        const decoded = jwt.verify(req.headers.authorization,JWT_Organization);
        if(decoded)
        {
            req.userData = decoded;
			const data = jwt.decode(req.headers.authorization);
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