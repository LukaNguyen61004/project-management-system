import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../repositories/auth.repository.js";

export const registerService= async( user_email: string, user_password:string)=>{
    //Check user ton tai chua
    const existingUser= await findUserByEmail(user_email);
    
    //Ton tai roi thi throw error
    if(existingUser){
        throw new Error ("Email already exist");
    }
    
    //Neu chua ton tai, tao user_name (! cho biet chac rang ko bi rong)
    const generatedName= user_email.split("@")[0]!;
    
    //Tao user_password_hashed
    const hashedPassword= await bcrypt.hash(user_password,10);

    //Tao user
    const user=await createUser(generatedName, user_email, hashedPassword);
   
    return user;


}