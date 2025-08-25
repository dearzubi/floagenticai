import express from "express";
import { Router } from "express";
import {
  getMCPServersController,
  getMCPCategoriesController,
  getUserMCPInstallationsController,
  installMCPServerController,
  updateMCPInstallationController,
  deleteMCPInstallationController,
  getMCPInstallationController,
} from "../controllers/mcp.controller.js";
import { schemaValidationMiddleware } from "../middlewares/schema-validation.middleware.js";
import { mcpAPIRequestSchemas } from "../schemas/mcp.schemas.js";

const router: Router = express.Router();

router.get(
  "/servers",
  (req, res, next) =>
    schemaValidationMiddleware(
      mcpAPIRequestSchemas.getMCPServers,
      req,
      res,
      next,
    ),
  getMCPServersController,
);

router.get("/categories", getMCPCategoriesController);

// User installations
router.get("/installations", getUserMCPInstallationsController);

router.post(
  "/installations",
  (req, res, next) =>
    schemaValidationMiddleware(
      mcpAPIRequestSchemas.installMCPServer,
      req,
      res,
      next,
    ),
  installMCPServerController,
);

router.get(
  "/installations/:id",
  (req, res, next) =>
    schemaValidationMiddleware(
      mcpAPIRequestSchemas.getMCPInstallation,
      req,
      res,
      next,
    ),
  getMCPInstallationController,
);

router.patch(
  "/installations/:id",
  (req, res, next) =>
    schemaValidationMiddleware(
      mcpAPIRequestSchemas.updateMCPInstallation,
      req,
      res,
      next,
    ),
  updateMCPInstallationController,
);

router.delete(
  "/installations/:id",
  (req, res, next) =>
    schemaValidationMiddleware(
      mcpAPIRequestSchemas.deleteMCPInstallation,
      req,
      res,
      next,
    ),
  deleteMCPInstallationController,
);

export default router;
