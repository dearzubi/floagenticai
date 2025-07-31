import express from "express";
import { Router } from "express";
import NodeRouter from "./node.router.js";
import WorkflowRouter from "./workflow.router.js";
import CredentialRouter from "./credential.router.js";
import ChatRouter from "./chat.router.js";
import { authValidationMiddleware } from "../middlewares/auth-validation.middleware.js";

const router: Router = express.Router();

router.use("/workflow/node", authValidationMiddleware, NodeRouter);
router.use("/workflow", authValidationMiddleware, WorkflowRouter);
router.use("/credential", authValidationMiddleware, CredentialRouter);
router.use("/chat", authValidationMiddleware, ChatRouter);

export default router;
