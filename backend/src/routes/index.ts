import {Router} from "express";

import authRoutes from './auth.routes.js';
import projectRouters from './project.routes.js'
import issueRouters from './issue.routes.js'

const router= Router();

router.use("/auth", authRoutes);

router.use("/projects", projectRouters);

router.use("/issues", issueRouters);



export default router;
