import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { summarizeSprintController } from "../controllers/ai.controller.js";

const router = Router();

router.post("/sprints/:sprintId/summarize", authMiddleware, summarizeSprintController);

export default router;