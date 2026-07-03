import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {createAttachmentController, deleteAttachmentController, getIssueAttachmentsController,} from "../controllers/attachment.controller.js";

const router = Router();

router.get("/issues/:issueId", authMiddleware, getIssueAttachmentsController);

router.post("/issues/:issueId", authMiddleware, createAttachmentController);

router.delete("/:attachmentId", authMiddleware, deleteAttachmentController);

export default router;