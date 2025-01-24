import mongoose, { Schema } from "mongoose";

const communityPostSchema = new Schema({
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    content:{
        type: String,
        required:true
    }
},{timestamps:true})

export const Community = mongoose.model("Community", communityPostSchema)