import {Router} from "express";
import { registerController } from "../controllers/auth.controller.js";
const router= Router();

router.get("/test", (req,res)=>{
    res.send("Auth route working");
});

router.post("/register", registerController)

export default router;