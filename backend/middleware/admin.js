const { JWT_ADMIN_PASSWORD } = require("../config");
const jwt = require("jsonwebtoken");


function adminMiddleware(req, res, next){
    const token = req.headers.token;
    const decoded = jwt.verify(token, JWT_ADMIN_PASSWORD);
    //jwt.verify() gives you an object

    if(decoded){
        req.adminId = decoded.id;
        //“Take the id from the decoded token, 
        // and attach it to the incoming request as req.adminId.
        // you can easily access which admin is making the request.”
        next();

    }else{
        res.status(403).json({
            message: "you are not signed in"
        })
    }
}

module.exports = {
    adminMiddleware: adminMiddleware
}