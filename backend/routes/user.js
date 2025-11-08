const { Router } = require("express");
const userRouter = Router();
const { User, Purchase } = require("../db");

const { z, } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config");
const { userMiddleware } = require("../middleware/user");



//signup end point
userRouter.post("/signup", async (req,res)=>{
    //zod validation
    const requireBody = z.object({
    name: z.string().min(1, {
      message: "name is required"
    }),
    email: z.string().email({
      message: "invalid email format"
    }),
    password: z.string().min(2, {
      message: "password must be at least 2 characters"
    })
  });

     
    // Parse the request body using the requireBody.safeParse() 
    // method to validate the data format
    // "safe" parsing (doesn't throw error if validation fails)
     const result = requireBody.safeParse(req.body);

    //If data is not correct then yeh response return kr do
     if(!result.success){
        return res.json({
            msg: "incorrect format",
            error: result.error
        })
     }

    // extract validate email, password, name from req.body
    const {email, password, name} = result.data;

    //hash the password with bcrypt with salt round of 5
    const hashPassword = await bcrypt.hash(password, 5);
//console.log("User:", User);
    
    // create a new user in db
try{
    await User.create({
        name,
        email,
        password: hashPassword
    });

}catch(e){
    return res.status(400).json({
        msg: "you are already signup",
        error: e.message
    })
}
    res.json({
        msg: 'signup successful'
    })
})


// POST route for user signin
userRouter.post("/signin",async (req,res)=>{
   const requireBody = z.object({
    email: z.string().email(),
    password: z.string().min(2)
   })


   const result = requireBody.safeParse(req.body);

   if(!result.success){
    return res.json({
        msg: "incorrect format",
        error: e.message
    })
   }

   const {email , password} = result.data;

   const user = User.findOne({
    email: email
   })

   if(!user){
    return res.json({
        msg: "invalid credintials "
    })
   }

    // Compare the provided password with the stored hashed password using bcrypt
    const passMatch = bcrypt.compare(password, user.password);

    if(passMatch){
        const token = jwt.sign({
            id: user._id,
        }, JWT_USER_PASSWORD)
        // send generated token back to the client 
        res.json({
            token: token
        })
    }
    else{
        return res.status(403).json({
            msg: "password does not match"
        })
    }


})



userRouter.get("/purchases",userMiddleware, async(req,res)=>{
    const userId = req.userId;

    const purchases = await Purchase.find({
        userId
    })

    res.json({
        purchases

    })
})//give purchases made my user

module.exports ={
    userRouter : userRouter
}