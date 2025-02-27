import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler( async(req, res, next)  => {
    try {
        const token = req.cookies?.accessToken || req.headers("Authorization").split(" ")[1]
        
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.userId = decodedToken._id;
        next();
    } catch (error) {
        throw new ApiError(401, 'Something went wrong while verifying the token')
    }
} )
    
