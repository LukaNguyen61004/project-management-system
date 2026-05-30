import {Router} from "express";

import authRoutes from './auth.routes.js';
import projectRouters from './project.routes.js'

const router= Router();

router.use("/auth", authRoutes);

router.use("/projects", projectRouters);



export default router;
