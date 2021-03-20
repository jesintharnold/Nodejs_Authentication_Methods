const mongoose=require('mongoose');
const DBconnect=async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true,useUnifiedTopology:true});
        console.log("Mongoose is connected");
    }catch (err){
        console.log(`MongoDB has following Error \n ${err}`);
    }
}

module.exports=DBconnect;