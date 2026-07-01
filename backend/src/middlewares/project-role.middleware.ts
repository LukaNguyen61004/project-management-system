import type { Request, Response, NextFunction } from "express";
import { findProjectMembership } from "../repositories/project.repository.js";

type ProjectRole = | "admin" | "member";

export const requireProjectRole = (allowedRoles: ProjectRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const projectId = Number(req.params.projectId);

            if (isNaN(projectId)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid project id",
                });
            }

            const membership =
                await findProjectMembership(
                    projectId,
                    req.user!.userId
                );

            if (!membership) {
                return res.status(403).json({
                    success: false,
                    error:
                        "Access denied",
                });
            }

            if (
                !allowedRoles.includes(
                    membership.role
                )
            ) {
                return res.status(403).json({
                    success: false,
                    error:
                        "Insufficient permissions",
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            });

        }
    }
}