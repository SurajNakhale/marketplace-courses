//to check weather the user is signed in or not
const jwt = require('jsonwebtoken');
const { JWT_USER_PASSWORD } = require('../config');



function userMiddleware(req, res, next){
    const token = req.headers.token;
    const decoded = jwt.verify(token, JWT_USER_PASSWORD);

    if(decoded){
        req.userId = decoded.id;
         //“Take the id from the decoded token, 
        // and attach it to the incoming request as req.userId.
        // you can easily access which user is making the request.”
        next();

    }else{
        res.status(403).json({
            mag: 'you are not signed in'
        })
    }
}

module.exports = {
    userMiddleware: userMiddleware
}