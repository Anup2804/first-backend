import mongoose from 'mongoose';
import {DB_NAME} from "../constants.js";

// This is the file which contain the code of monogodb connection.

const connectDB = async()=>{
    try{
        
        const connectionString = `${process.env.MONGODB_URL}/${DB_NAME}`;
        // The above line has the connection string and db name.
        // console.log('Connecting to:', connectionString);  
        await mongoose.connect(connectionString);
        console.log('connected to database');
    }catch(error){
        console.log("Monogodb Connection ERROR:",error);
        
    }
}


export default connectDB;