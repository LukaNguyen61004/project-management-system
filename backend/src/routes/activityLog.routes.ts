import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getProjectActivityLogController } from "../controllers/activityLog.controller.js";

const router = Router();

router.get("/projects/:projectId/activity", authMiddleware, getProjectActivityLogController);

export default router;