import mongoose from 'mongoose';
import {DB_NAME} from "../constants.js";

const connectDB = async()=>{
    try{
        
        const connectionString = `${process.env.MONGODB_URL}/${DB_NAME}`;
        console.log('Connecting to:', connectionString);  
        await mongoose.connect(connectionString);
        console.log('connected to database');
    }catch(error){
        console.log("mongodb connection error",error);
        
    }
}


export default connectDB;