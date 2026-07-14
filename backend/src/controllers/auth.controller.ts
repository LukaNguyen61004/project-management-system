import type { Request, Response } from "express";
import { registerSchema, loginSchema, googleLoginSchema, updateProfileSchema } from "../validatons/auth.validation.js";
import { registerService, loginService, firebaseGoogleLoginService, getCurrentUserService, refreshTokenService, logoutService, updateProfileService } from "../services/auth.service.js";
import { sendError } from "../helper/httpError.js";
import { setRefreshCookie, clearRefreshCookie } from "../utils/cookie.js";


export const registerController = async (req: Request, res: Response) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const user = await registerService(validatedData.user_email, validatedData.user_password);

        return res.status(201).json({
            message: "Register successful",
            user,
        });
    } catch (error) {
        return sendError(res, error, 400);
    }
};

export const loginController = async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const { refreshToken, ...rest } = await loginService(
            validatedData.user_email,
            validatedData.user_password
        );

        setRefreshCookie(res, refreshToken);

        return res.status(200).json({
            message: "Login successful",
            data: rest,
        });
    } catch (error) {
        return sendError(res, error, 401);
    }
};

export const firebaseGoogleLoginController = async (req: Request, res: Response) => {
    try {
        const validatedData = googleLoginSchema.parse(req.body);

        const { refreshToken, ...rest } = await firebaseGoogleLoginService(validatedData.idToken);

        setRefreshCookie(res, refreshToken);

        return res.status(200).json({
            message: "Google login sucessfull",
            data: rest,
        });
    } catch (error) {
        return sendError(res, error, 401);
    }
};

export const getCurrentUserController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return sendError(res, new Error("Unauthorized"), 401);
        }

        const user = await getCurrentUserService(req.user.userId);

        return res.status(200).json({
            data: user,
        });
    } catch (error) {
        return sendError(res, error, 401);
    }
};

export const refreshTokenController = async (req: Request, res: Response) => {
    try {
        const refreshToken =
            req.cookies?.refreshToken ||
            (typeof req.body?.refreshToken === "string" ? req.body.refreshToken : null);

        if (!refreshToken) {
            return sendError(res, new Error("Refresh token required"), 400);
        }

        const data = await refreshTokenService(refreshToken);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        clearRefreshCookie(res);
        return sendError(res, error, 401);
    }
};

export const logoutController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return sendError(res, new Error("Unauthorized"), 401);
        }

        const data = await logoutService(req.user.userId);
        clearRefreshCookie(res);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        clearRefreshCookie(res);
        return sendError(res, error, 400);
    }
};

export const updateProfileController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return sendError(res, new Error("Unauthorized"), 401);
        }

        const validatedData = updateProfileSchema.parse(req.body);
        const user = await updateProfileService(req.user.userId, validatedData);

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    } catch (error) {
        return sendError(res, error, 400);
    }
};
