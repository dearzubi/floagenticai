import express from "express";
import { Router } from "express";
import {
  getCredentialController,
  createCredentialController,
  updateCredentialController,
  deleteCredentialController,
  getCredentialListController,
  getCredentialsByCredentialNamesController,
} from "../controllers/credential.crud.controller.js";
import { schemaValidationMiddleware } from "../middlewares/schema-validation.middleware.js";
import { credentialAPIRequestSchemas } from "../schemas/credential.schemas.js";
import { listAllCredentialDefinitionsController } from "../controllers/credential.definition.controller.js";

const router: Router = express.Router();

router.get("/list/definitions", listAllCredentialDefinitionsController);

router.get(
  "/list/by-names/:credentialNames",
  (req, res, next) =>
    schemaValidationMiddleware(
      credentialAPIRequestSchemas.getCredentialsByCredentialNames,
      req,
      res,
      next,
    ),
  getCredentialsByCredentialNamesController,
);

router.get("/list", getCredentialListController);

router.get(
  "/:id",
  (req, res, next) =>
    schemaValidationMiddleware(
      credentialAPIRequestSchemas.getCredential,
      req,
      res,
      next,
    ),
  getCredentialController,
);

router.post(
  "/",
  (req, res, next) =>
    schemaValidationMiddleware(
      credentialAPIRequestSchemas.createCredential,
      req,
      res,
      next,
    ),
  createCredentialController,
);

router.patch(
  "/:id",
  (req, res, next) =>
    schemaValidationMiddleware(
      credentialAPIRequestSchemas.updateCredential,
      req,
      res,
      next,
    ),
  updateCredentialController,
);

router.delete(
  "/:id",
  (req, res, next) =>
    schemaValidationMiddleware(
      credentialAPIRequestSchemas.deleteCredential,
      req,
      res,
      next,
    ),
  deleteCredentialController,
);

export default router;
