import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireProjectRole } from "../middlewares/project-role.middleware.js";
import { changeSprintStatusController, createSprintController, getProjectSprintsController, getSprintDetailController, 
         getSprintIssuesController, updateSprintController 
} from "../controllers/sprint.controller.js";


const router = Router();

router.post("/projects/:projectId/sprints", authMiddleware, requireProjectRole(["admin"]), createSprintController);

router.get("/projects/:projectId/sprints", authMiddleware, getProjectSprintsController);

router.get("/:sprintId/issues", authMiddleware, getSprintIssuesController);

router.get("/:sprintId",authMiddleware, getSprintDetailController);

router.patch("/:sprintId", authMiddleware,  updateSprintController);

router.patch("/:sprintId/status", authMiddleware, changeSprintStatusController);

export default router;