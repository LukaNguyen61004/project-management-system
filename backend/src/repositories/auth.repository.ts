import prisma from "../lib/prisma.js";

export const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: {
            user_email: email,
        },
    });
};

export const createUser =async (user_name:string, user_email:string, hashedPassword:string)=>{
    return prisma.user.create({
        data:{
            user_name,
            user_email,
            user_password_hash: hashedPassword,
        }
    })
}