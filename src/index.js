import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});



connectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000,()=>{
    console.log(`connectd to port ${process.env.PORT}`);
  })
})
.catch((err)=>{
  console.log('connection failed!!',err)
})

// ;(async()=>{
//     try{
//        await mongoose.connect(`${process.env.MONOGODB_URL}/${DB_NAME}`)
//     }catch(error){
//         console.log(error);
//         throw err
//     }
// })()
