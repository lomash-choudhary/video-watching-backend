import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


export const connectToDB = async () => {
    try {
        const connectionResponse = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log(`DB connected succesfully !! \n ${connectionResponse.connection.host}`)//this will give the host to which our db is connected right now
    } catch (error) {
        console.log(`Something went wrong while connecting to DB: ${error}`)
        throw error
    }
}