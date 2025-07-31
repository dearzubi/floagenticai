import { Workflow } from "../../../database/entities/workflow.entity.js";
import { createWorkflow, getWorkflow } from "../crud/index.js";
import { User } from "../../../database/entities/user.entity.js";
import { safeParseJSON } from "../../../utils/misc.js";
import {
  ImportWorkflowAPIRequestData,
  workflowSerialisedReactFlowSchema,
} from "../../../api/v1/schemas/workflow.schemas.js";
import { ValidationError } from "../../../utils/errors/validation.error.js";
import type { Edge, Node } from "@xyflow/react";
import { WorkflowBuilderUINodeData } from "common";
import { cloneDeep } from "lodash-es";
import { ExportedWorkflow } from "./types.js";

/**
 * Exports a workflow by removing sensitive data (credentials) and returning sanitized flow data
 * @param workflowId - The ID of the workflow to export
 * @param userId - The ID of the user requesting the export
 * @returns Promise<WorkflowAPIResponse> - The sanitized workflow data
 */
export const exportWorkflow = async (
  workflowId: string,
  userId: string,
): Promise<ExportedWorkflow> => {
  const workflow = await getWorkflow(workflowId, userId, false);

  const serialisedReactFlow = safeParseJSON(
    workflow.flowData,
    workflowSerialisedReactFlowSchema,
  );

  if (!serialisedReactFlow) {
    throw new ValidationError("Invalid workflow flow data");
  }

  const sanitizedNodes = (
    serialisedReactFlow.nodes as Node<WorkflowBuilderUINodeData>[]
  ).map((node) => {
    const sanitizedNode = cloneDeep(node);

    sanitizedNode.data.versions = sanitizedNode.data.versions.map(
      (version) => ({
        ...version,
        inputs: version.inputs || {},
        credentials: [],
      }),
    );

    return sanitizedNode;
  });

  return {
    name: workflow.name,
    serialisedReactFlow: {
      viewport: serialisedReactFlow.viewport,
      nodes: sanitizedNodes,
      edges: serialisedReactFlow.edges as Edge[],
    },
    config: workflow.config || undefined,
    category: workflow.category || undefined,
    exportedAt: new Date().toISOString(),
    currentVersion: workflow.currentVersion,
  } satisfies ExportedWorkflow;
};

/**
 * Imports a workflow from exported data, creating a new workflow instance
 * @param data - The import request data containing workflow data and optional name
 * @param user - The user importing the workflow
 * @returns Promise<Workflow> - The created workflow
 */
export const importWorkflow = async (
  data: ImportWorkflowAPIRequestData["body"],
  user: User,
): Promise<
  Workflow & {
    serialisedReactFlow: ExportedWorkflow["serialisedReactFlow"];
  }
> => {
  const { workflowData, name } = data;

  if (!workflowData || typeof workflowData !== "object") {
    throw new ValidationError("Invalid workflow data format");
  }

  const exportedWorkflow = workflowData as unknown as ExportedWorkflow;

  if (!exportedWorkflow.name || !exportedWorkflow.serialisedReactFlow) {
    throw new ValidationError(
      "Invalid workflow data: missing required fields (name, serialisedReactFlow)",
    );
  }

  const validatedFlowData = workflowSerialisedReactFlowSchema.safeParse(
    exportedWorkflow.serialisedReactFlow,
  );

  if (!validatedFlowData.success) {
    throw new ValidationError("Invalid workflow flow data structure");
  }

  const workflowName = name || `${exportedWorkflow.name} (Imported)`;

  const workflow = await createWorkflow(
    {
      name: workflowName,
      serialisedReactFlow: validatedFlowData.data,
    },
    user,
  );

  return {
    ...workflow,
    serialisedReactFlow: validatedFlowData.data,
  };
};
