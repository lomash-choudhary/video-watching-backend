import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { z } from "zod";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const registerUser = asyncHandler( async (req, res) => {
    //get user details from the body ✅
    //validate those details and check that fileds should not be empty ✅
    //user should be unique check that also based on username and email - might not be needed ✅
    //check for files like images, avatar are they uploaded by the user ✅
    //check are they uploaded successfully on the cloudinary? ✅
    // create a user object in the database✅
    // check for user creation ✅
    // return the response to the user by removing the password and refresh token filed from the object✅


    const {username, email, password, fullName, avatar, coverImage} = req.body;
    if(
        [username, email, password, fullName, avatar].some((fields) => fields?.trim() == "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const validationBody = z.object({
        username: z.string()
        .min(3,'Username is too short')
        .max(20, 'Username is too long'),

        email: z.string().email('Please enter a valid email'),

        password: z.string()
        .min(8, 'Password atleast should contain minimum of 8 characters')
        .regex(/[A-Z]/, 'Password should contain atleast one upper case character')
        .regex(/[a-z]/, 'Password should contain atleast one lower case character')
        .regex(/[0-9]/, 'Password should contain atleast one numeric character')
        .regex(/[\W_]/, 'Password should contain atleast one special case character'),

        fullName: z.string()
        .min(3,'Please enter a valid full name')
    })

    const parsedBody = validationBody.safeParse(req.body)
    if(!parsedBody.success){
        throw new ApiError(400, 'Error occured while validating the body make sure you pass every validation')
    }

    const doesUserAlreadyExists = await User.findOne(
        {
            $or: [{ username:username },{ email:email }]
        }
    )
    if(doesUserAlreadyExists){
        throw new ApiError(409, 'User with this username or email exists in the database')
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, 'Avatar file is required')
    }
     
    const avatarCloudinaryUpload = await uploadOnCloudinary(avatarLocalPath)
    const coverImageCloudinaryUpload = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatarCloudinaryUpload){
        throw new ApiError(400, 'Avatar file is required')
    }


    const user = await User.create({
        username,
        password,
        email,
        fullName,
        avatar: avatarCloudinaryUpload,
        coverImage: coverImageCloudinaryUpload || ""
    })



    const isUserCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!isUserCreated){
        throw new ApiError(500, 'Something went wrong signing up the user! Please try again later')
    }

    return res.status(201).json(
        new ApiResponse(200, isUserCreated, 'User created successfully')
    )

} )