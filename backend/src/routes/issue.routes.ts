import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {assignIssueController, changeIssueStatusController,  createIssueController, 
       deleteIssueController, getIssueDetailController, getProjectIssuesController, 
       updateIssueController, changIssuePriorityController, updateIssueSprintController
} from "../controllers/issue.controller.js";



const router = Router();

router.post( "/projects/:projectId", authMiddleware, createIssueController);

router.get("/projects/:projectId/issues", authMiddleware, getProjectIssuesController);

router.get("/:issueId",authMiddleware, getIssueDetailController);

router.patch("/:issueId",authMiddleware, updateIssueController);

router.delete("/:issueId",authMiddleware, deleteIssueController);

router.patch("/:issueId/status",authMiddleware, changeIssueStatusController);

router.patch("/:issueId/assign",authMiddleware, assignIssueController)

router.patch("/:issueId/priority",authMiddleware, changIssuePriorityController);

router.patch("/:issueId/sprint", authMiddleware, updateIssueSprintController);

export default router;