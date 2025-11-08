const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;


const userSchema = new mongoose.Schema({
    
    email: String,
    password: String,
    name: String
    
})
const courseSchema = new mongoose.Schema({
    
    title: String,
    description: String,
    price: String,
    imageUrl: String,
    creatorId: ObjectId,

    
})
const adminSchema = new mongoose.Schema({
    
    email: String,
    password: String,
    name: String
    
})
const purchaseSchema = new mongoose.Schema({
    
    courseId: ObjectId,
    userId: ObjectId
    
})


const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Purchase = mongoose.model('Purchase', purchaseSchema);


module.exports = {
    User,
    Course,
    Admin,
    Purchase
}