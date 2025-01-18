import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile:{
            type:String, //cloudinary
            required:true
        },
        thumbnail:{
            type:String, //cloudinary
            required:true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        title:{
            type: String,
            required:true,
            trim:true
        },
        description:{
            type:String,
            required:true,
            trim:true
        },
        duration:{
            type:Number, //cloudinary will give us info about our file and we can extract duration from the info
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            required:true
        }
    },
    {
        timestamps:true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)