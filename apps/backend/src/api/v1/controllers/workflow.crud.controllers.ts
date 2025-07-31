import { Request, Response, NextFunction } from "express";
import {
  createWorkflow,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getWorkflowList,
} from "../../../services/workflow/crud/index.js";
import { User } from "../../../database/entities/user.entity.js";
import {
  CreateWorkflowAPIRequestData,
  GetWorkflowAPIRequestData,
  DeleteWorkflowAPIRequestData,
  UpdateWorkflowAPIRequestData,
  workflowSerialisedReactFlowSchema,
} from "../schemas/workflow.schemas.js";
import { Workflow } from "../../../database/entities/workflow.entity.js";
import { safeParseJSON } from "../../../utils/misc.js";
import { ValidationError } from "../../../utils/errors/validation.error.js";
import { decryptData } from "../../../utils/encryption.js";

export type WorkflowAPIResponse = {
  serialisedReactFlow: CreateWorkflowAPIRequestData["body"]["serialisedReactFlow"];
} & Omit<Workflow, "flowData" | "user">;

export const createWorkflowController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const body = req.body as CreateWorkflowAPIRequestData["body"];

    const workflow = await createWorkflow(body, user);

    res.status(201).json({
      id: workflow.id,
      name: workflow.name,
      currentVersion: workflow.currentVersion,
      serialisedReactFlow: body.serialisedReactFlow,
      isActive: workflow.isActive,
      apiKey: workflow.apiKey,
      config: workflow.config,
      category: workflow.category,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    } satisfies WorkflowAPIResponse);
  } catch (error) {
    next(error);
  }
};

export const getWorkflowController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;

    const params = req.params as GetWorkflowAPIRequestData["params"];

    const workflow = await getWorkflow(params.id, user.id);

    const serialisedReactFlow = safeParseJSON(
      workflow.flowData,
      workflowSerialisedReactFlowSchema,
    );

    if (!serialisedReactFlow) {
      throw new ValidationError(`Workflow with id ${params.id} is corrupted`);
    }

    res.status(200).json({
      id: workflow.id,
      name: workflow.name,
      currentVersion: workflow.currentVersion,
      serialisedReactFlow: serialisedReactFlow,
      isActive: workflow.isActive,
      config: workflow.config,
      category: workflow.category,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    } satisfies WorkflowAPIResponse);
  } catch (error) {
    next(error);
  }
};

export const getWorkflowListController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;

    const workflows = await getWorkflowList(user.id);

    res.status(200).json(
      workflows
        .map((workflow) => {
          const serialisedReactFlow = safeParseJSON(
            workflow.flowData,
            workflowSerialisedReactFlowSchema,
          );
          if (!serialisedReactFlow) {
            return null;
          }

          return {
            id: workflow.id,
            name: workflow.name,
            currentVersion: workflow.currentVersion,
            serialisedReactFlow: serialisedReactFlow,
            isActive: workflow.isActive,
            config: workflow.config,
            category: workflow.category,
            createdAt: workflow.createdAt,
            updatedAt: workflow.updatedAt,
          } satisfies WorkflowAPIResponse;
        })
        .filter((workflow) => workflow !== null),
    );
  } catch (error) {
    next(error);
  }
};

export const updateWorkflowController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;

    const params = req.params as UpdateWorkflowAPIRequestData["params"];
    const body = req.body as UpdateWorkflowAPIRequestData["body"];

    const workflow = await updateWorkflow(params.id, body, user);

    const decryptedFlowData = decryptData(workflow.flowData);

    const serialisedReactFlow = safeParseJSON(
      decryptedFlowData.ok ? decryptedFlowData.plainText : "",
      workflowSerialisedReactFlowSchema,
    );

    if (!serialisedReactFlow) {
      throw new ValidationError(`Workflow with id ${params.id} is corrupted`);
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
    } satisfies WorkflowAPIResponse);
  } catch (error) {
    next(error);
  }
};

export const deleteWorkflowController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;

    const params = req.params as DeleteWorkflowAPIRequestData["params"];

    await deleteWorkflow(params.id, user);

    res.status(200).json({
      message: "Workflow deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
