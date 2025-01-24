import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    comment:{
        type: Schema.Types.ObjectId,
        ref:"Comment"
    },
    video:{
        type: Schema.Types.ObjectId,
        ref:"Video"
    },
    likedBy:{
        type: Schema.Types.ObjectId,
        ref:"User"
    },
    communityPost:{
        type: Schema.Types.ObjectId,
        ref: "Community"
    }
})

export const Like = mongoose.model("Like", likeSchema)