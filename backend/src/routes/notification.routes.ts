import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getNotificationsController,  markAsReadController,  markAllAsReadController,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", authMiddleware, getNotificationsController);

router.patch("/:notifiId/read", authMiddleware, markAsReadController);

router.patch("/read-all", authMiddleware, markAllAsReadController);

export default router;