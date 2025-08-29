import express from "express";
import { Router } from "express";
import {
  listAllNodesController,
  loadMethodController,
} from "../controllers/node.controllers.js";
import { schemaValidationMiddleware } from "../middlewares/schema-validation.middleware.js";
import { nodeAPIRequestSchemas } from "../schemas/node.schemas.js";

const router: Router = express.Router();

router.get("/list", listAllNodesController);
router.post(
  "/load-method",
  (req, res, next) =>
    schemaValidationMiddleware(
      nodeAPIRequestSchemas.loadMethod,
      req,
      res,
      next,
    ),
  loadMethodController,
);

export default router;
