import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createEpicController, deleteEpicController,  getEpicDetailController,  getProjectEpicsController,
         updateEpicController,
} from "../controllers/epic.controller.js";

const router = Router();

router.post("/projects/:projectId",  authMiddleware,  createEpicController);

router.get( "/projects/:projectId", authMiddleware, getProjectEpicsController);

router.get( "/:epicId", authMiddleware, getEpicDetailController);

router.patch("/:epicId", authMiddleware,updateEpicController);

router.delete("/:epicId", authMiddleware,deleteEpicController);

export default router;