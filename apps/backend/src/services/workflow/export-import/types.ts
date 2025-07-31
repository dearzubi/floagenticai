import { WorkflowAPIResponse } from "../../../api/v1/controllers/workflow.crud.controllers.js";

export type ExportedWorkflow = Omit<
  WorkflowAPIResponse,
  "id" | "createdAt" | "updatedAt" | "isActive"
> & {
  exportedAt: string;
};
