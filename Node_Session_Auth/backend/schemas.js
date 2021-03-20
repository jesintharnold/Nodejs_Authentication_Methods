const mongoose=require('mongoose');
const bcrypt = require("bcrypt");
const shortID=require("shortid");


const user_schema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },
    resetPasswordToken:{
        type:String,
        unique:true
    },
    resetPasswordExpiry:Date
});

user_schema.pre('save',async function (next){
    this.email=this.email.toLowerCase();
    this.username=this.username.toLowerCase();
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

user_schema.methods.verifyPassword=async function (password){
    return await bcrypt.compare(password, this.password);
}

user_schema.methods.resetToken=async function(){
    const Token=shortID().toString();
    console.log(`Short-ID : ${Token}`);
    this.resetPasswordToken=Token;
    this.resetPasswordExpiry=Date.now()+(5*(60000));
    return Token;
}

user_schema.methods.passChange=async function(password){
    this.password=password;
    this.resetPasswordToken=undefined;
    this.resetPasswordExpiry=undefined;
}



const User=mongoose.model('user',user_schema);
module.exports=User;