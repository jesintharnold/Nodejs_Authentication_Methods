require('dotenv').config({path:'./session.env'});
const express=require('express');
const mongoose=require('mongoose');
const session=require('express-session');
const DBconnect=require('./DB');
const User=require('./schemas');
const app=express();
app.use(express.json());
DBconnect();

app.use(session({
    secret:process.env.SESSION_SEC,
    resave:true,
    saveUninitialized:false,
    name:"Session-userID"
}));

app.post('/register',async (req,res)=>{
   let {email,password,username}=req.body;
   if(!username && !password &&  !email){
       res.status(400).json({
           "Error":"Please Provide the credentials"
       });
   }else {
       try {
           const user = await User.create({email:email,password:password,username:username});
           res.status(201).json({Message: "User registered , Try Logging-In now"});
       } catch (err) {
           res.status(400).json({"Error": `${err}`});
       }
   }
});

app.post('/login',async (req,res)=>{
    let {email,password}=req.body;
    if(!email&&!password){
    res.status(400).json({Error:"Please provide your Credentials"});
    }
    else{
    try{
        const userDetail=await User.findOne({email:email});
        const isMatch= await userDetail.verifyPassword(password);
        if(isMatch){
            try{
              req.session.User={
                  user:userDetail.username,
                  email:userDetail.email
              }
              res.status(200).json({Message:"Session has been set"});
          }catch (err){
              res.status(400).json({Error:"Session can't be set"});
          }
        }
        else{
            res.status(400).json({Error:`Invalid credentials`});
        }
    }catch (err){
            res.status(404).json({Error:'Error occured'});
    }}

});

const protect=async (req, res, next) => {
    if (req.session.User) {
        console.log(req.session.User);
        next();
    } else {
        res.status(401).json({Error:'Authorization failed! Please login'});
    }
};

app.get('/protected',protect,(req, res) => {
    res.status(200).json({
        username:`${req.session.User.user}`,
        email:`${req.session.User.email}`
    })
});

app.post('/forgetPassword',async (req,res)=>{
    let{email}=req.body;
    if(!email){
        res.status(400).json({Error:"Please Provide your Email"});
    }
    else{
        try{
            const forgetPass=await User.findOne({email:email});
            if (forgetPass) {
                const Token = await forgetPass.resetToken();
                forgetPass.save();
                res.status(200).json({URL: `http://localhost:5000/resetPassword/${Token}`});
            }
            else {
                res.status(400).json({Error:"The Email is not Found"});
            }
        }catch (err){
             res.status(400).json({Error:`${err}`});
        }
    }
});

app.put('/resetPassword/:Token',async (req,res)=>{
    const Token=req.params.Token;
    let {password}=req.body;
    console.log(`${password}`);

    if(!Token && !password){
        res.status(400).json({Error:`Token or Password not found`});
    }else{
        try{
            const Token_Detail=await User.findOne({resetPasswordToken:Token.toString()});
            console.log(Token_Detail);
            if(!Token_Detail){
                res.status(400).json({Error:`Token not found or Token Expired`});
            }else {
                 Token_Detail.passChange(password);
                 Token_Detail.save();
                res.status(200).json({Message: `Password has been Updated`});
            }
        }
        catch (err) {
            res.status(404).json({Error:`{err}`});
        }
    }
});

app.listen(process.env.PORT||5000,()=>console.log(`Node_Session_Auth has been started in ${process.env.PORT}`));