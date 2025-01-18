import dotenv from "dotenv";
dotenv.config({
    path:"./env"
});
import { connectToDB } from "./db/index.js";
import app from "./app.js";
connectToDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ App is listening on port ${process.env.PORT}`)
    })
    app.on("error", (error) => {
        console.log(`Error occured while listening on the port by app ${error}`)
        throw error
    })
})
.catch((error) => {
    console.log(`Error connecting to DB ${error}`)
    throw error
})
