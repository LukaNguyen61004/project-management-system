import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { summarizeSprintController } from "../controllers/ai.controller.js";
import { aiRateLimit } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/sprints/:sprintId/summarize", authMiddleware, aiRateLimit, summarizeSprintController);

export default router;