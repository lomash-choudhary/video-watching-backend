import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    content:{
        type: Schema.Types.ObjectId,
        required:true
    },
    video:{
        type: Schema.Types.ObjectId,
        req: "Video"
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps:true})

export const Comment = mongoose.model("Comment", commentSchema)
