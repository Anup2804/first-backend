import mongoose, { Schema } from "mongoose";

const videoSchema = new mongoose.Schema(
    {
        videofile:{
            type:String,
            required:true,
        },
        thumbnail:{
            type:String,
            required:true
        },
        title:{
            type:String,
            required:true
        },
        Description:{
            type:String,
            required:true
        },
        time:{
            type:Number,
            required:true
        },
        view:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref:'User'
        }
    },{timestamps:true}
)

export const Video = mongoose.model("Video",videoSchema);