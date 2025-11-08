const express = require('express');
const mongoose = require('mongoose');

const app = express();
const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/course")
const { adminRouter } = require("./routes/admin")

app.use(express.json());

app.use("/api/v1/user", userRouter)
app.use("/api/v1/course", courseRouter)
app.use("/api/v1/admin", adminRouter)

async function main(){
    await mongoose.connect('mongodb+srv://surajnakhale2407:N3F4XZJre6QBdf5g@cluster0.z76fefw.mongodb.net/courseApp')
    .then(()=> console.log("mongoose connected"))
    .catch((err)=> console.error("error occured", err))
    app.listen(3000);
}

main();
