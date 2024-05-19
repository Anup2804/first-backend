import mongoose from 'mongoose';
import {DB_NAME} from "../constants.js";

const connectDB = async()=>{
    try{
        const url =  "mongodb+srv://anupc3214:Anup123@backendbyanup.lr3wmks.mongodb.net";
        const connectionString = `${url}/${DB_NAME}`;
        console.log('Connecting to:', connectionString);  
        await mongoose.connect(connectionString);
        console.log('connected to database');
    }catch(error){
        console.log("mongodb connection error",error);
        
    }
}


export default connectDB;