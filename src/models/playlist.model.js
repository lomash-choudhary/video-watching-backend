import mongoose, { Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const playlistSchema = new Schema({
    name:{
        type:String,
        required: [true, "Please enter the name of the playlist to continue"]
    },
    description:{
        type:String,
    },
    videos:{
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

playlistSchema.plugin(mongooseAggregatePaginate)

export const Playlist = mongoose.model('Playlist', playlistSchema)