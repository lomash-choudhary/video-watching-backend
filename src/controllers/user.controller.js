import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { z } from "zod";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import fs from "fs";

const generateAccessTokenAndRefreshToken = async (userId) => {
  const user = await User.findById(userId)
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false })
  return {refreshToken, accessToken};
}

const signUpUser = asyncHandler(async (req, res) => {
  //get user details from the body ✅
  //validate those details and check that fileds should not be empty ✅
  //user should be unique check that also based on username and email - might not be needed ✅
  //check for files like images, avatar are they uploaded by the user ✅
  //check are they uploaded successfully on the cloudinary? ✅
  // create a user object in the database✅
  // check for user creation ✅
  // return the response to the user by removing the password and refresh token filed from the object✅

  const { username, email, password, fullName, avatar, coverImage } = req.body;
  console.log(req.body);
  if (
    [username, email, password, fullName, avatar].some(
      (fields) => fields?.trim() == ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  console.log("above all fileds required");
  const validationBody = z.object({
    username: z
      .string()
      .min(3, "Username is too short")
      .max(20, "Username is too long"),

    email: z.string().email("Please enter a valid email"),

    password: z
      .string()
      .min(8, "Password atleast should contain minimum of 8 characters")
      .regex(
        /[A-Z]/,
        "Password should contain atleast one upper case character"
      )
      .regex(
        /[a-z]/,
        "Password should contain atleast one lower case character"
      )
      .regex(/[0-9]/, "Password should contain atleast one numeric character")
      .regex(
        /[\W_]/,
        "Password should contain atleast one special case character"
      ),

    fullName: z.string().min(3, "Please enter a valid full name"),
  });

  const parsedBody = validationBody.safeParse(req.body);
  if (!parsedBody.success) {
    throw new ApiError(
      400,
      "Error occured while validating the body make sure you pass every validation"
    );
  }

  const doesUserAlreadyExists = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (doesUserAlreadyExists) {
    fs.unlinkSync(avatarLocalPath);
    fs.unlinkSync(coverImageLocalPath);
    throw new ApiError(
      409,
      "User with this username or email exists in the database"
    );
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarCloudinaryUpload = await uploadOnCloudinary(avatarLocalPath);
  const coverImageCloudinaryUpload =
    await uploadOnCloudinary(coverImageLocalPath);

  if (!avatarCloudinaryUpload) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    username,
    password,
    email,
    fullName,
    avatar: avatarCloudinaryUpload,
    coverImage:
      coverImageCloudinaryUpload === "Path not found"
        ? ""
        : coverImageCloudinaryUpload,
  });

  const isUserCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!isUserCreated) {
    throw new ApiError(
      500,
      "Something went wrong signing up the user! Please try again later"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, isUserCreated, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //info like username email and pass
  // compare pass hash pass
  // if true then the user can move forward we will generate their access token and refresh token refresh token we will save in db and access token we will save in local storage
  // send cookie

  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required to login");
  }

  //check if the user exists in the database or not
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const validatePassword = await user.isPasswordCorrect(password);

  if (!validatePassword) {
    throw new ApiError(401, "Invalid user credentails");
  }
  const {refreshToken, accessToken} = await generateAccessTokenAndRefreshToken(user._id);
  
  user.refreshToken = refreshToken


  const cookieOptions = {
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, cookieOptions)
  .cookie("refreshToken", refreshToken, cookieOptions)
  .json(
    new ApiResponse(200,user.refreshToken, 'Logged In successfully')
  )

});

const logoutUser = asyncHandler( async(req, res) => {
  const user = await User.findOneAndUpdate(
    {
      _id: req.userId
    },
    {
      $set: {
        refreshToken: ""
      }
    },
    {
      new: true
    }
  )
  if(!user){
    throw new ApiError(404, 'Invalid request')
  }

  const cookieOptions = {
    httpOnly:true,
    secure:true
  }
  return res.status(200)
  .clearCookie("accessToken", cookieOptions)
  .clearCookie("refreshToken", cookieOptions)
  .json(
    new ApiResponse(200,{}, "Logged Out successfully")
  )
} )


const refreshAccessToken = asyncHandler( async(req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(400, 'Unauthorized request')
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(400, 'Invalid refresh token')
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(400, "Refresh token is either expired or used")
    }
  
    const cookieOptions = {
      httpOnly:true,
      secure:true
    }
  
    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user?._id)
  
    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, refreshToken, "Access Token regenerated successfully")
    )
  } catch (error) {
    throw new ApiError(500, 'Error occured while generating the access token please login again to continue further')
  }

})

const changeCurrentPassword = asyncHandler( async(req, res) => {
  // get the old and new password
  const {oldPassword, newPassword} = req.body;

  const user = await User.findById(req.userId)
  console.log(user)
  const correctPassword = user.isPasswordCorrect(oldPassword)

  if(!correctPassword){
    throw new ApiError(400, 'Wrong password')
  }

  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(
    new ApiResponse(200, {}, 'Password changed Successfully')
  )

} )

const getUserDetails = asyncHandler( async(req, res) => {
  const user = await User.findById(req.userId).select("-password -refreshToken")
  return res
  .status(200)
  .json(
    new ApiResponse(200, user, 'Fetched user details successfully')
  )
} )




export {
  signUpUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  getUserDetails
}