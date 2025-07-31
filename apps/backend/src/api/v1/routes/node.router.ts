import express from "express";
import { Router } from "express";
import { listAllNodesController } from "../controllers/node.controllers.js";

const router: Router = express.Router();

router.get("/list", listAllNodesController);

export default router;
