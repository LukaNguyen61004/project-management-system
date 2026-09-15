import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import admin, { isFirebaseAdminReady } from "../lib/firebaseAdmin.js";
import { env } from "../config/env.js";
import { generateAccessToken } from "../utils/jwt.js";
import { findUserByEmail, createUser, findUserById, updateUserProfile } from "../repositories/auth.repository.js";
import { createRefreshToken, lockByTokenHash, markReplaced, revokeAllForUser, revokeFamily } from "../repositories/refreshToken.repository.js";
import prisma from "../lib/prisma.js";
import type { UpdateProfileInput } from "../validations/auth.validation.js";
import type { RefreshJwtPayload } from "../types/jwt.type.js";
import { hashRefreshToken, ROTATION_GRACE_MS } from "../utils/refreshToken.js";

function toSafeUser<T extends { user_password_hash?: string | null }>(user: T) {
    const { user_password_hash, ...safeUser } = user;
    return safeUser;
}

async function issueTokenPair(user: {
    user_id: number;
    user_email: string;
    provider: string;
}) {
    const familyId = randomUUID();
    const { token: refreshToken } = await createRefreshToken(
        prisma,
        user.user_id,
        familyId
    );
    const accessToken = generateAccessToken({
        userId: user.user_id,
        email: user.user_email,
        provider: user.provider,
    });
    return { accessToken, refreshToken };
}


export const refreshTokenService = async (refreshToken: string) => {
    let decoded: RefreshJwtPayload;
    try {
        const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
        if (typeof payload === "string" || payload.userId == null || !payload.familyId || !payload.jti) {
            throw new Error("Invalid token");
        }
        decoded = payload as RefreshJwtPayload;
    } catch {
        throw new Error("Invalid or expired refresh token");
    }

    const tokenHash = hashRefreshToken(refreshToken);
    return prisma.$transaction(async (tx) => {
        const row = await lockByTokenHash(tx, tokenHash);
        if (!row) {
            throw new Error("Invalid or expired refresh token");
        }
        if (row.user_id !== decoded.userId || row.family_id !== decoded.familyId) {
            throw new Error("Invalid or expired refresh token");
        }
        if (row.revoked_at || row.expires_at.getTime() <= Date.now()) {
            throw new Error("Invalid or expired refresh token");
        }
        const user = await findUserById(decoded.userId);
        if (!user) {
            throw new Error("Invalid or expired refresh token");
        }
        const accessToken = generateAccessToken({
            userId: user.user_id,
            email: user.user_email,
            provider: user.provider,
        });
        // Đã rotate rồi → grace hoặc reuse
        if (row.replaced_by) {
            const rotatedAt = row.rotated_at?.getTime() ?? 0;
            if (Date.now() - rotatedAt <= ROTATION_GRACE_MS) {
                return { accessToken };
            }
            await revokeFamily(tx, row.family_id);
            console.warn("[AUTH] Refresh token reuse detected", {
                userId: row.user_id,
                familyId: row.family_id,
            });
            throw new Error("Invalid or expired refresh token");
        }
        // Token hiện tại → rotate
        const { token: newRefreshToken, id: newId } = await createRefreshToken(
            tx,              // cùng transaction với lock
            user.user_id,
            row.family_id    // GIỮ family, không randomUUID mới
        );
        await markReplaced(tx, row.id, newId);
        return { accessToken, refreshToken: newRefreshToken };
    });

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

    const { accessToken, refreshToken } = await issueTokenPair(user);

    //Tra ve tt user va token
    return {
        safeUser: toSafeUser(user),
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


    const { accessToken, refreshToken } = await issueTokenPair(user);

    return {
        safeUser: toSafeUser(user),
        accessToken,
        refreshToken,
    }
}

export const getCurrentUserService = async (userId: number) => {
    const user = await findUserById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    return toSafeUser(user);

}

export const logoutService = async (userId: number, refreshToken: string | null) => {

    if (refreshToken) {
        const row = await prisma.refreshToken.findUnique({
            where: { token_hash: hashRefreshToken(refreshToken) },
        });
        if (row && row.user_id === userId) {
            await revokeFamily(prisma, row.family_id);
            return { message: "Logout successful" };
        }
    }
    await revokeAllForUser(prisma, userId);
    return { message: "Logout successful" };

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

    return toSafeUser(updated);
};

