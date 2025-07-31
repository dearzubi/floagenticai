import { Request, Response, NextFunction } from "express";
import {
  getWorkflowVersions,
  getWorkflowVersion,
  restoreWorkflowVersion,
  deleteWorkflowVersion,
} from "../../../services/workflow/version/index.js";
import { User } from "../../../database/entities/user.entity.js";
import {
  GetWorkflowVersionsAPIRequestData,
  GetWorkflowVersionAPIRequestData,
  RestoreWorkflowVersionAPIRequestData,
  DeleteWorkflowVersionAPIRequestData,
  workflowSerialisedReactFlowSchema,
} from "../schemas/workflow.schemas.js";
import { WorkflowVersion } from "../../../database/entities/workflow-version.entity.js";
import { safeParseJSON } from "../../../utils/misc.js";
import { ValidationError } from "../../../utils/errors/validation.error.js";
import { decryptData } from "../../../utils/encryption.js";

type WorkflowVersionAPIResponse = {
  serialisedReactFlow: {
    viewport: { x: number; y: number; zoom: number };
    nodes: Record<string, unknown>[];
    edges: Record<string, unknown>[];
  };
} & Omit<WorkflowVersion, "flowData" | "user" | "workflow">;

type WorkflowVersionListAPIResponse = Omit<
  WorkflowVersionAPIResponse,
  "serialisedReactFlow"
>;

export const getWorkflowVersionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const params = req.params as GetWorkflowVersionsAPIRequestData["params"];
    const query = req.validatedQuery as GetWorkflowVersionsAPIRequestData["query"];

    const versions = await getWorkflowVersions(
      params.workflowId,
      user.id,
      true,
      query.page,
      query.limit,
    );

    res.status(200).json(
      versions.map((version) => ({
        id: version.id,
        version: version.version,
        name: version.name,
        config: version.config,
        category: version.category,
        description: version.description,
        createdAt: version.createdAt,
        updatedAt: version.updatedAt,
      })) satisfies WorkflowVersionListAPIResponse[],
    );
  } catch (error) {
    next(error);
  }
};

export const getWorkflowVersionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const params =
      req.params as unknown as GetWorkflowVersionAPIRequestData["params"];

    const workflowVersion = await getWorkflowVersion(
      params.workflowId,
      params.version,
      user.id,
      false,
    );

    const serialisedReactFlow = safeParseJSON(
      workflowVersion.flowData,
      workflowSerialisedReactFlowSchema,
    );

    if (!serialisedReactFlow) {
      throw new ValidationError(
        `Workflow version ${params.version} for workflow ${params.workflowId} is corrupted`,
      );
    }

    res.status(200).json({
      id: workflowVersion.id,
      version: workflowVersion.version,
      name: workflowVersion.name,
      serialisedReactFlow: serialisedReactFlow,
      config: workflowVersion.config,
      category: workflowVersion.category,
      description: workflowVersion.description,
      createdAt: workflowVersion.createdAt,
      updatedAt: workflowVersion.updatedAt,
    } satisfies WorkflowVersionAPIResponse);
  } catch (error) {
    next(error);
  }
};

export const restoreWorkflowVersionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const params =
      req.params as unknown as RestoreWorkflowVersionAPIRequestData["params"];
    const body = req.body as RestoreWorkflowVersionAPIRequestData["body"];

    const workflow = await restoreWorkflowVersion(
      params.workflowId,
      params.version,
      user,
      body.description,
    );

    const decryptedFlowData = decryptData(workflow.flowData);

    const serialisedReactFlow = safeParseJSON(
      decryptedFlowData.ok ? decryptedFlowData.plainText : "",
      workflowSerialisedReactFlowSchema,
    );

    if (!serialisedReactFlow) {
      throw new ValidationError(
        `Restored workflow ${params.workflowId} is corrupted`,
      );
    }

    res.status(200).json({
      id: workflow.id,
      name: workflow.name,
      currentVersion: workflow.currentVersion,
      serialisedReactFlow: serialisedReactFlow,
      isActive: workflow.isActive,
      apiKey: workflow.apiKey,
      config: workflow.config,
      category: workflow.category,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkflowVersionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const params =
      req.params as unknown as DeleteWorkflowVersionAPIRequestData["params"];

    await deleteWorkflowVersion(params.workflowId, params.version, user.id);

    res.status(200).json({
      message: "Workflow version deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
