import type { Request, Response } from "express";
import { registerSchema, loginSchema, googleLoginSchema } from "../validatons/auth.validation.js";
import { registerService, loginService, firebaseGoogleLoginService, getCurrentUserService, refreshTokenService, logoutService } from "../services/auth.service.js";


export const registerController = async (req: Request, res: Response) => {
    try {
        const validatedData = registerSchema.parse(req.body); // lay du lieu tu request -> validate

        const user = await registerService(validatedData.user_email, validatedData.user_password);

        res.status(201).json({
            message: "Register successful",
            user,
        });

    } catch (error) {
        res.status(300).json({
            error:
                error instanceof Error ? error.message : "Unknown error",
        })

    }
}

export const loginController = async (req: Request, res: Response) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const user = await loginService(validatedData.user_email, validatedData.user_password);

        res.status(200).json({
            message: "Login successful",
            data: user,
        })
    } catch (error) {
        res.status(401).json({
            error: error instanceof Error ? error.message : "Unknow error"
        })
    }
}

export const firebaseGoogleLoginController = async (req: Request, res: Response) => {
    try {
        const validatedData = googleLoginSchema.parse(req.body);

        const user = await firebaseGoogleLoginService(validatedData.idToken);

        res.status(200).json({
            message: "Google login sucessfull",
            user,
        })
    } catch (error) {
        res.status(401).json({
            error: error instanceof Error ? error.message : "Unknow error",
        });
    }
};

export const getCurrentUserController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const user = await getCurrentUserService(req.user.userId);

        res.status(200).json({
            data: user,
        })

    } catch (error) {
        res.status(401).json({
            error: error instanceof Error ? error.message : "Unknow"
        });
    }
};

export const refreshTokenController = async (req: Request, res: Response) => {
    try {
        
        const { refreshToken } = req.body;


        if (!refreshToken) {
            return res.status(400).json({
                error: "Refresh token required",
            });
        }

        const data = await refreshTokenService(refreshToken);

        res.status(200).json({
            success: true,
            data,
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

export const logoutController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const data = await logoutService(req.user.userId);

        res.status(200).json({
            success: true,
            data,
        });


    } catch (error) {
        res.status(400).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error",
        });
    }
}



