import {Router} from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { registerController, loginController, firebaseGoogleLoginController, 
         getCurrentUserController, refreshTokenController, logoutController, updateProfileController } from "../controllers/auth.controller.js";
import { authRateLimit } from "../middlewares/rateLimit.middleware.js";
const router= Router();

router.get("/test", (req,res)=>{
    res.send("Auth route working");
});

router.post("/register", authRateLimit,registerController);

router.post("/login",authRateLimit, loginController);

router.post("/google", authRateLimit, firebaseGoogleLoginController);

router.get("/me",authMiddleware, getCurrentUserController);

router.post("/refresh-token", refreshTokenController);

router.post("/logout", authMiddleware, logoutController);

router.patch("/me", authMiddleware, updateProfileController);



export default router;