import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createCommentController, deleteCommentController, getIssueCommentsController, updateCommentController } from "../controllers/comment.controller.js";

const router = Router();

router.post("/issues/:issueId/comments", authMiddleware, createCommentController);

router.get("/issues/:issueId/comments", authMiddleware, getIssueCommentsController);

router.patch("/issues/:issueId/comments/:commentId", authMiddleware, updateCommentController);

router.delete("/issues/:issueId/comments/:commentId", authMiddleware, deleteCommentController);

export default router;