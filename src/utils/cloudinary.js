import { v2 as cloudinary, v2 } from 'cloudinary';
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
        fs.unlinkSync(localFilePath)
        return cloudinaryResponse.url
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log(`Error occured while uploading the file \n Try again${error}`)
    }
}   

export const deleteFromCloudinary = async(fileToBeDeleted, resourceType, type) => {
    try{
        const deleteData = await v2.api
        .delete_resources([fileToBeDeleted],
            {
                type:type,
                resource_type:resourceType
            }
        )
        if(!deleteData){
            console.log("unable to delete the file")
            return false
        }
        console.log("deleted successfully")
        return true
    }
    catch(err){
        console.log(`error occured while deleting the file ${err}`)
    }
}

// cloudinary.v2.api
//   .delete_resources(['ViewSphereFiles/ajmycejilp9bn0bg4nx0'], 
//     { type: 'upload', resource_type: 'image' })
//   .then(console.log);