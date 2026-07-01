import {Router} from "express";

import authRoutes from './auth.routes.js';
import projectRouters from './project.routes.js'
import issueRouters from './issue.routes.js'
import sprintRouters from "./sprint.routes.js"
import activityLogRouters from "./activityLog.routes.js"
import commentRouter from "./comment.router.js"
import epicRouter from "./epic.routes.js"
import notificationRouter from "./notification.routes.js"

const router= Router();

router.use("/auth", authRoutes);

router.use("/projects", projectRouters);

router.use("/issues", issueRouters);

router.use("/sprints", sprintRouters);

router.use("/activities",activityLogRouters);

router.use("/comments", commentRouter);

router.use("/epics",epicRouter);

router.use("/notifications", notificationRouter);



export default router;
