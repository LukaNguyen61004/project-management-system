import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireProjectRole } from "../middlewares/project-role.middleware.js";
import { createProjectController, getUserProjectsController, getProjectDetailController,
         inviteMemberController, acceptInvitationController, getProjectMembersController,
         removeProjectMemberController, leaveProjectController, updateProjectController,
        deleteProjectController
} from "../controllers/project.controller.js";


const router = Router();

router.post("/", authMiddleware, createProjectController);

router.get("/", authMiddleware, getUserProjectsController);

router.get("/:projectId",authMiddleware,getProjectDetailController);

router.post("/:projectId/invite",authMiddleware, requireProjectRole(["admin"]), inviteMemberController);

router.post("/invitations/accept",authMiddleware,acceptInvitationController);

router.get("/:projectId/members", authMiddleware, requireProjectRole(["admin", "member"]), getProjectMembersController);

router.delete("/:projectId/members/:userId", authMiddleware, requireProjectRole(["admin"]), removeProjectMemberController);

router.post("/:projectId/leave", authMiddleware, requireProjectRole(["admin","member"]), leaveProjectController);

router.patch("/:projectId", authMiddleware, requireProjectRole(["admin"]), updateProjectController);

router.delete("/:projectId",authMiddleware, requireProjectRole(["admin"]), deleteProjectController);

export default router;