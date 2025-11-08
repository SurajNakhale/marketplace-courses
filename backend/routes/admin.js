
const { Router } = require("express");
const { Admin, Course } = require('../db');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const z = require("zod");
const { JWT_ADMIN_PASSWORD } = require("../config");
const { parse } = require("dotenv");
const { adminMiddleware } = require("../middleware/admin");

const adminRouter = Router();


// adminRouter.use();


adminRouter.post("/signup", async (req, res)=>{
//zod validation 
    const requireBody = z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(2)
    }) 

//safeparsed request body safeParse is a object which gives if sucsess:true return data else via is the output
    const result = requireBody.safeParse(req.body);

//check if the input is valid or not , below msg gets displayed if credentials are wrong
    if(!result.success){
        return res.json({
            msg: "invalide credentials!!"
        })
    }

    //extract vlaidate email,pass, name from req.body
    const { name, email, password } = result.data;

    //
    const hashPassword = await bcrypt.hash(password, 5);
 try{
     Admin.create({
        name,
        email,
        password: hashPassword
 
     })
 }catch(e){
    return res.status(400).json({
        msg: "you are already signup",
        error: e.message
    })
 }

 res.json({
    msg: "signup successful"
 })
})



adminRouter.post("/signin",async (req, res)=>{
    const requireBody = z.object({
        email: z.string().email(),
        password: z.string().min(2)
    })

    const result = requireBody.safeParse(req.body);

    if(!result.success){
        return res.json({
            msg:"invlalid credentials",
            error: e.msg
        })
    }

    const {email, password} = result.data;

    const admin = Admin.findOne({
        email: email
    })

    if(!admin){
        res.json({
            msg: "invalid credentials"
        })
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if(passwordMatch){
        const token  = jwt.sign({
            id: admin._id,
        }, JWT_ADMIN_PASSWORD)

        res.json({
            token: token
        })
    }else{
        res.json({
            msg: "password does not match"
        })
    }
})


// admin route to create a course
adminRouter.post('/course', adminMiddleware, async (req, res)=>{
    const adminId = req.adminId;//gets the adminId from 
    // the request object, which was previously attached
    //  by your adminMiddleware
    
  const requireBody = z.object({
    title: z.string().min(3),//title must be at list 3 characters
    description: z.string().min(5),//must be at least 5 characters
    imageUrl: z.string().url().optional(),//image url must be valid url
    price: z.number().positive(),//price must be positive number
  })  

  //parse and validate the requirebody
  const parseData = requireBody.safeParse(req.body);

  if(!parseData.success){
    return res.json({
        message: "incorrect data format",
        error: parseData.error
    })
}
//get title description image price from the req.body postman 
const {title, description, imageUrl, price} = req.body;

//create a new course
const course = await Course.create({
    title,
    description,
    imageUrl,
    price,
    creatorId: adminId,
});

//response with success message if the course is created successfully
res.status(201).json({
    message: "course created",
    courseId: course._id,
    });
});

//route for updating course content
adminRouter.put('/course', adminMiddleware, async (req,res)=>{
// get the admin id from the request object it identifyes which 
// admin is making request
    const adminId = req.adminId;

const requireBody = z.object({
    courseId: z.string().min(5),//ensure course id at least 5 characters
    title: z.string().min(3).optional(),//ensure title is at 
                                      //  least 3 characters
                                      // title is optional
    description: z.string().optional(),// description optional
    imageUrl: z.string().url(),// image url optional
    price: z.number().positive().optional(),// price optional
})
//parse and validate incomming fields from the request body
    const parseData = requireBody.safeParse(req.body);

    //checks if validation fails, respond with message and error details
    if(!parseData.success){
        return res.json({
            message: "inavlid format",
            error: parseData.error,
        })
    }

    //desctuction
    // insteade of const title = req.body.title we write const{title} = req.body;
    const {title, description, courseId, imageUrl, price} = req.body;
    //When a client (like a frontend app or API user) sends a request to your server,
    //  they usually send data in the body of the request — for example,
    //  when creating or updating a course.You access that data using req.body.

    const course = await Course.findOne({
        _id: courseId,//match the course by id
        creatorId: adminId,// ensure the admin is the creator of the course
    })

    //ifcourse is not found ,respond with with an error msg
    if(!course){
        return res.json({
            msg: "course not found",
        })
    }

    // update the course details in the databse using the updated object
    await Course.updateOne({
        _id: courseId,//match course by courseid
        creatorId: adminId,//ensure the admin is creator of that course
    },
    {
        title: title || course.title,
        description: description || course.description,
        price: price || course.price,
        imageUrl: imageUrl || course.imageUrl,

    }
    );

    res.json({
        msg: 'course updated'

    })
});

adminRouter.delete("/course", adminMiddleware, async(req, res)=>{
    const adminId = req.adminId;

    const requireBody = z.object({
        courseId: z.string().min(5),//must be atleast 5 characters
    })
    
    const parseData = requireBody.safeParse(req.body);

    if(!parseData.succe){
        return res.json({
            msg: "invalid data",
            error: parseData.error,
        })
    }

    const { courseId } = req.body;

    const course = await Course.findOne({
        _id: courseId,
        creatorId: adminId,

    });

    if(!course){
        return res.json({
            msg: "course not found",
        })
    }


    await Course.deleteOne({
        _id: courseId,
        creatorId: adminId,
    })

    res.json({
        msg: "course deleted successfully"
    })
})

    //admin route for gettting all the courses
adminRouter.get("/couse/bulk",adminMiddleware, async (req,res)=>{
    const adminId = req.adminId;

    const courses = await Course.find({
        creatorId: adminId,
    })
    res.json({
        courses: courses,

    })
})

module.exports = {
    adminRouter : adminRouter
}