import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin, { isFirebaseAdminReady } from "../lib/firebaseAdmin.js";
import { env } from "../config/env.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { findUserByEmail, createUser, findUserById, updateRefreshToken, updateUserProfile } from "../repositories/auth.repository.js";
import type { UpdateProfileInput } from "../validatons/auth.validation.js";

export const refreshTokenService = async (refreshToken: string) => {
    try {
        const decoded = jwt.verify(
            refreshToken,
            env.JWT_SECRET
        )
        if (typeof decoded === "string") {
            throw new Error("Invalid token");
        }

        const user = await findUserById(decoded.userId);

        if (!user) {
            throw new Error("User not found");
        }

        if (user.refresh_token !== refreshToken) {
            throw new Error("Invalid refresh token");
        }

        const newAccessToken = generateAccessToken({ userId: user.user_id, email: user.user_email, provider: user.provider });
        return { accessToken: newAccessToken };

    } catch (error) {
        throw new Error(
            "Invalid or expired refresh token"
        );
    }
}

export const registerService = async (user_email: string, user_password: string) => {
    //Check user ton tai chua
    const existingUser = await findUserByEmail(user_email);

    //Ton tai roi thi throw error
    if (existingUser) {
        throw new Error("Email already exist");
    }

    //Neu chua ton tai, tao user_name (! cho biet chac rang ko bi rong)
    const generatedName = user_email.split("@")[0]!;

    //Tao user_password_hashed
    const hashedPassword = await bcrypt.hash(user_password, 10);

    //Tao user
    const user = await createUser(generatedName, user_email, hashedPassword, "LOCAL");

    const {
        user_password_hash,
        ...safeUser
    } = user;

    return safeUser;
}

export const loginService = async (user_email: string, user_password: string) => {
    const user = await findUserByEmail(user_email);
    // Check User da ton tai chua
    if (!user) {
        throw new Error('Invalid credentials');
    }

    //Check user co dang nhap bang pt khac ko
    if (user.provider === "GOOGLE") {
        throw new Error("This account uses Google login");
    }

    //Check xem co password ko
    if (!user.user_password_hash) {
        throw new Error("Invalid account state");
    }

    //So sanh password
    const isMatch = await bcrypt.compare(user_password, user.user_password_hash);

    if (!isMatch) {
        throw new Error("Invalid credentials")
    }

    //tao token
    const accessToken = generateAccessToken({
        userId: user.user_id,
        email: user.user_email,
        provider: user.provider,
    });

    const refreshToken = generateRefreshToken({ userId: user.user_id, });

    await updateRefreshToken(
        user.user_id,
        refreshToken
    );

    const {
        user_password_hash,
        refresh_token,
        ...safeUser
    } = user;

    //Tra ve tt user va token
    return {
        safeUser,
        accessToken,
        refreshToken
    };
};

export const firebaseGoogleLoginService = async (idToken: string) => {
    if (!isFirebaseAdminReady()) {
        throw new Error("Google login is not configured on this server");
    }

    const decode = await admin.auth().verifyIdToken(idToken);

    //lay thong tin user
    const email = decode.email;

    const name = decode.name || email?.split("@")[0];

    const avatar = decode.picture || null;

    if (!email) {
        throw new Error("Invalid Google Account");
    }

    let user = await findUserByEmail(email);

    if (!user) {
        user = await createUser(name, email, null, "GOOGLE");
    }

    if (user.provider === "LOCAL") {
        throw new Error("This email uses password login");
    }

    const accessToken = generateAccessToken({
        userId: user.user_id,
        email: user.user_email,
        provider: user.provider,
    });

    const refreshToken = generateRefreshToken({ userId: user.user_id, });

    await updateRefreshToken(
        user.user_id,
        refreshToken
    );

    const {
        user_password_hash,
        refresh_token,
        ...safeUser
    } = user;

    return {
        safeUser,
        accessToken,
        refreshToken,
    }
}

export const getCurrentUserService = async (userId: number) => {
    const user = await findUserById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const { user_password_hash, refresh_token, ...safeUser} = user;
    
    return safeUser;
}

export const logoutService = async (userId: number)=>{
    await updateRefreshToken(userId, null);

    return {
        message: "Logout successful"
    }
}


export const updateProfileService = async (
    userId: number,
    data: UpdateProfileInput
) => {
    const user = await findUserById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const updateData: { user_name?: string; user_avatar_url?: string | null } = {}

    if (data.user_name !== undefined) {
        updateData.user_name = data.user_name
    }

    if (data.user_avatar_url !== undefined) {
        updateData.user_avatar_url = data.user_avatar_url === "" ? null : data.user_avatar_url
    }

    const updated = await updateUserProfile(userId, updateData);

    const { user_password_hash, refresh_token, ...safeUser } = updated;
    return safeUser;
};

