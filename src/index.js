import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

connectDB();
// console.log(process.env.MONOGODB_URL);

// ;(async()=>{
//     try{
//        await mongoose.connect(`${process.env.MONOGODB_URL}/${DB_NAME}`)
//     }catch(error){
//         console.log(error);
//         throw err
//     }
// })()
