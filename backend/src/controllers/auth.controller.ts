import type { Request, Response  } from "express";
import { registerschema } from "../validatons/auth.validation.js";
import { registerService } from "../services/auth.service.js";

export const registerController= async(req:Request, res:Response)=>{
    try{
        const validatedData = registerschema.parse(req.body); // lay du lieu tu request -> validate

        const user= await registerService(validatedData.user_email,validatedData.user_password); 

        res.status(201).json({
            message:"Register successful",
            user,
        });

    }catch(error){
        res.status(300).json({
            error:
               error instanceof Error ? error.message : "Unknown error",
        })

    }
}