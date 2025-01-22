import { Router } from "express";
import { signUpUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getUserDetails } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/signup").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    signUpUser
)
router.route("/login").post(loginUser)


//custom middleware usuage
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/accessTokenGeneration").post(refreshAccessToken)
router.route("/changePassword").post(verifyJWT,changeCurrentPassword)
router.route("/getUser").get(verifyJWT,getUserDetails)




export default router
