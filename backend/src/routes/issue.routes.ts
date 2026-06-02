import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {createIssueController, deleteIssueController, getIssueDetailController, getProjectIssuesController, updateIssueController,} from "../controllers/issue.controller.js";


const router = Router();

router.post( "/projects/:projectId", authMiddleware, createIssueController);

router.get("/projects/:projectId/issues", authMiddleware, getProjectIssuesController);

router.get("/:issueId",authMiddleware, getIssueDetailController);

router.patch("/:issueId",authMiddleware, updateIssueController);

router.delete("/:issueId",authMiddleware, deleteIssueController);

export default router;