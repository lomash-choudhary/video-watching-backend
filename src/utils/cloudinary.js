import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return 'Path not found'
    
        const cloudinaryResponse = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "ViewSphereFiles"
        })
        if(!cloudinaryResponse){
            throw new Error('Unable to upload the file on cloudinary')
        }

        console.log('Uploaded on cloudinary successfully')
        fs.unlink(localFilePath)
        return cloudinaryResponse.url
    } catch (error) {
        fs.unlink(localFilePath)
        console.log(`Error occured while uploading the file \n Try again${error}`)
    }
}   