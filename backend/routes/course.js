
const { Router } = require("express");
const { userMiddleware } = require("../middleware/user");
const { Purchase, Course } = require("../db");

const courseRouter = Router();


//purchase course
courseRouter.post("/purchase", userMiddleware, async(req,res)=>{
    const userId = req.userId;
    const courseId = req.body.courseId;

    if(!courseId){
        return res.json({
            msg: "please provide a courseId",
        })
    }

    try{
        const existingPurchase = await Purchase.findOne({
            courseId: courseId,
            userId: userId,

        })
        if(existingPurchase){
            return res.json({
                msg: "you already bought the course",
            })
        }

        await Purchase.create({
            courseId: courseId,
            userId: userId,
        })

        res.json({
            msg: "purchased course successfully!!",
        })
    }catch(e){
        res.json({
            msg:"error occured",
            error: error.message,
        })
    }
})//if user want to pusrchase


//list all the courses
courseRouter.get("/preview",async (req,res)=>{

    try{
        const courses = await Course.find({});
        res.json({
            courses: courses,
        })
    }catch(e){
        res.json({
            msg: "error occured fetchin courses",
            error: error.msg,
        })

    }
})

module.exports = {
    courseRouter : courseRouter
}