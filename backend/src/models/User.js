const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, 'Name is required'],
        trim:true
    },

    email:{
        type:String,
        required: [true, 'Email is required'],
        unique:true,
        lowercase:true,
        trim:true
    },

    password:{
     type:String,
     required: [true, 'Password is required'],
     select:false,
    minlength: [8, 'Password must be at least 8 characters long'],
}

},{timestamps:true})


const User = mongoose.model('User',userSchema)


module.exports = User


