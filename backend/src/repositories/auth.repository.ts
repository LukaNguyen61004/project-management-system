import prisma from "../lib/prisma.js";

export const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: {
            user_email: email,
        },
    });
};

export const createUser = async (user_name: string, user_email: string, hashedPassword: string | null, provider: "LOCAL" | "GOOGLE") => {
    return prisma.user.create({
        data: {
            user_name,
            user_email,
            user_password_hash: hashedPassword,
            provider,
        }
    })
}

export const findUserById = async (userId: number) => {
    return prisma.user.findUnique({
        where: {
            user_id: userId
        },
    });
};

export const updateRefreshToken = async ( userId: number, refreshToken: string | null) => {
    return prisma.user.update({
      where: {
        user_id: userId,
      },
      data: {
        refresh_token: refreshToken,
      },
    });
  };

