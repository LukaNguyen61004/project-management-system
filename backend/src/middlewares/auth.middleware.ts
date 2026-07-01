import type { Request, Response, NextFunction } from "express";
import type { AuthJwtPayload } from "../types/jwt.type.js";

import jwt from "jsonwebtoken";


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const JWT_SECRET = process.env.JWT_SECRET!;

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: "Access token required",
        });
    }
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Invalid token format",
        });
    }

    const token = authHeader.split(" ")[1]!;

    try {
        const decoded = jwt.verify(
            token, JWT_SECRET
        );

        if (typeof decoded === "string") {
            throw new Error("Invalid token")
        }

        req.user = decoded as AuthJwtPayload;

        next();

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            error: "Invalid or experied token"
        })
    }


}

