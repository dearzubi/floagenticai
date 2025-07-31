import express from "express";
import { Router } from "express";
import {
  getWorkflowController,
  createWorkflowController,
  updateWorkflowController,
  deleteWorkflowController,
  getWorkflowListController,
} from "../controllers/workflow.crud.controllers.js";
import {
  getWorkflowVersionsController,
  getWorkflowVersionController,
  restoreWorkflowVersionController,
  deleteWorkflowVersionController,
} from "../controllers/workflow.version.controllers.js";
import {
  exportWorkflowController,
  importWorkflowController,
} from "../controllers/workflow.export-import.controllers.js";
import { schemaValidationMiddleware } from "../middlewares/schema-validation.middleware.js";
import { workflowAPIRequestSchemas } from "../schemas/workflow.schemas.js";

const router: Router = express.Router();

router.get("/list", getWorkflowListController);

router.get(
  "/:id/export",
  (req, res, next) =>
    schemaValidationMiddleware(
      workflowAPIRequestSchemas.exportWorkflow,
      req,
      res,
      next,
    ),
  exportWorkflowController,
);

router.post(
  "/import",
  (req, res, next) =>
    schemaValidationMiddleware(
      workflowAPIRequestSchemas.importWorkflow,
      req,
      res,
      next,
    ),
  importWorkflowController,
);

router.get(
  "/:workflowId/versions",
  (req, res, next) =>
    schemaValidationMiddleware(
      workflowAPIRequestSchemas.getWorkflowVersions,
      req,
      res,
      next,
    ),
  getWorkflowVersionsController,
);

router.get(
  "/:workflowId/versions/:version",
  (req, res, next) =>
    schemaValidationMiddleware(
      workflowAPIRequestSchemas.getWorkflowVersion,
      req,
      res,
      next,
    ),
  getWorkflowVersionController,
);

router.post(
  "/:workflowId/versions/:version/restore",
  (req, res, next) =>
    schemaValidationMiddleware(
      workflowAPIRequestSchemas.restoreWorkflowVersion,
      req,
      res,
      next,
    ),
  restoreWorkflowVersionController,
);

router.delete(
  "/:workflowId/versions/:version",
  (req, res, next) =>
    schemaValidationMiddleware(
      workflowAPIRequestSchemas.deleteWorkflowVersion,
      req,
      res,
      next,
    ),
  deleteWorkflowVersionController,
);

router.get(
  "/:id",
  (req, res, next) =>
    schemaValidationMiddleware(
      workflowAPIRequestSchemas.getWorkflow,
      req,
      res,
      next,
    ),
  getWorkflowController,
);

router.post(
  "/",
  (req, res, next) =>
    schemaValidationMiddleware(
      workflowAPIRequestSchemas.createWorkflow,
      req,
      res,
      next,
    ),
  createWorkflowController,
);

router.patch(
  "/:id",
  (req, res, next) =>
    schemaValidationMiddleware(
      workflowAPIRequestSchemas.updateWorkflow,
      req,
      res,
      next,
    ),
  updateWorkflowController,
);

router.delete(
  "/:id",
  (req, res, next) =>
    schemaValidationMiddleware(
      workflowAPIRequestSchemas.deleteWorkflow,
      req,
      res,
      next,
    ),
  deleteWorkflowController,
);

export default router;
