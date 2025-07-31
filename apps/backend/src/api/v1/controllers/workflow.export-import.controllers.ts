import { NextFunction, Request, Response } from "express";
import { User } from "../../../database/entities/user.entity.js";
import {
  ExportWorkflowAPIRequestData,
  ImportWorkflowAPIRequestData,
} from "../schemas/workflow.schemas.js";
import {
  exportWorkflow,
  importWorkflow,
} from "../../../services/workflow/export-import/index.js";

export const exportWorkflowController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const params = req.params as ExportWorkflowAPIRequestData["params"];

    const exportedData = await exportWorkflow(params.id, user.id);

    res.status(200).json(exportedData);
  } catch (error) {
    next(error);
  }
};

export const importWorkflowController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user as User;
    const body = req.body as ImportWorkflowAPIRequestData["body"];

    const workflow = await importWorkflow(body, user);

    res.status(201).json({
      id: workflow.id,
      name: workflow.name,
      currentVersion: workflow.currentVersion,
      serialisedReactFlow: workflow.serialisedReactFlow,
      isActive: workflow.isActive,
      apiKey: workflow.apiKey,
      config: workflow.config,
      category: workflow.category,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      message: "Workflow imported successfully",
    });
  } catch (error) {
    next(error);
  }
};
