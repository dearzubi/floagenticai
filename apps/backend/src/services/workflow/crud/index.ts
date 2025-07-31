import { Workflow } from "../../../database/entities/workflow.entity.js";
import { v4 as uuidv4 } from "uuid";
import { decryptData, encryptData } from "../../../utils/encryption.js";
import { User } from "../../../database/entities/user.entity.js";
import { getDB } from "../../../database/init.js";
import { NotFoundError } from "../../../utils/errors/notfound.error.js";
import { FilterQuery } from "@mikro-orm/core";
import { ValidationError } from "../../../utils/errors/validation.error.js";
import {
  CreateWorkflowAPIRequestData,
  UpdateWorkflowAPIRequestData,
} from "../../../api/v1/schemas/workflow.schemas.js";
import { logger } from "../../../utils/logger/index.js";
import { createWorkflowVersion } from "../version/index.js";
import { WorkflowVersion } from "../../../database/entities/workflow-version.entity.js";

/**
 * Asynchronously creates a new workflow and saves it to the database. The react flow data is encrypted to ensure privacy.
 *
 * @param {CreateWorkflowAPIRequestData["body"]} data - The body data required to create the workflow. Includes properties like `name` and the serialized react flow data.
 * @param {User} user - The user entity associated with this workflow creation.
 * @returns {Promise<Workflow>} A promise that resolves to the newly created workflow entity.
 */
export const createWorkflow = async (
  data: CreateWorkflowAPIRequestData["body"],
  user: User,
): Promise<Workflow> => {
  const db = await getDB();

  const workflow = db.create(Workflow, {
    id: uuidv4(),
    name: data.name,
    flowData: encryptData(JSON.stringify(data.serialisedReactFlow)),
    currentVersion: 1,
    user: user,
    isActive: true,
  });
  await db.flush();

  return workflow;
};

/**
 * Retrieves a workflow from the database by its unique identifier. Optionally,
 * it ensures that the workflow belongs to a specific user if a user ID is provided.
 * The workflow's data is decrypted before being returned.
 *
 * @param {string} workflowId - The unique identifier of the workflow.
 * @param {string} [userId] - An optional user ID to verify ownership of the workflow.
 * @param {boolean} keepFlowDataEncrypted - A boolean indicating whether to keep the workflow data encrypted (default: false).
 * @returns {Promise<Workflow>} A promise that resolves to the workflow object.
 * @throws {NotFoundError} If no workflow with the specified ID is found.
 * @throws {ValidationError} If the workflow data cannot be successfully decrypted.
 */
export const getWorkflow = async (
  workflowId: string,
  userId?: string,
  keepFlowDataEncrypted?: boolean,
): Promise<Workflow> => {
  const db = await getDB();

  const where: FilterQuery<Workflow> = userId
    ? {
        id: workflowId,
        user: userId,
      }
    : {
        id: workflowId,
      };

  const workflow = await db.findOne(Workflow, where);
  if (!workflow) {
    throw new NotFoundError(`Workflow with id ${workflowId} not found`);
  }

  if (!keepFlowDataEncrypted) {
    const decryptedData = decryptData(workflow.flowData);

    if (!decryptedData.ok) {
      throw new ValidationError(`Workflow with id ${workflowId} is corrupted`);
    }

    workflow.flowData = decryptedData.plainText;
  }

  return workflow;
};

/**
 * Retrieves the list of workflows associated with a specific user.
 *
 * This function fetches workflows for a given user from the database,
 * decrypts their react flow data, and returns them. If a workflow's flow data
 * cannot be decrypted, a warning is logged, and that workflow excluded from the response.
 *
 * @param {string} userId - The unique identifier of the user whose workflows are being retrieved.
 * @returns {Promise<Workflow[]>} A promise that resolves to an array of Workflow objects associated with the user.
 */
//TODO: Paginate response
export const getWorkflowList = async (userId: string): Promise<Workflow[]> => {
  const db = await getDB();

  const workflows = await db.find(Workflow, {
    user: userId,
  });

  const returnWorkflows: Workflow[] = [];

  for (const workflow of workflows) {
    const decryptedData = decryptData(workflow.flowData);
    if (!decryptedData.ok) {
      logger.warn(
        `Workflow with id ${workflow.id} of user ${userId} is corrupted`,
      );
      continue;
    }
    workflow.flowData = decryptedData.plainText;
    returnWorkflows.push(workflow);
  }

  return returnWorkflows;
};

/**
 * Updates an existing workflow with the provided data in the database.
 *
 * @param {string} workflowId - The unique identifier of the workflow to be updated.
 * @param {UpdateWorkflowAPIRequestData["body"]} data - Contains the updated values for the workflow including name, configuration, category, active status, and serialized React Flow data.
 * @param {User} user - The user entity associated with the workflow.
 * @returns {Promise<Workflow>} A promise that resolves to the updated workflow entity.
 * @throws {NotFoundError} If the workflow with the specified ID is not found or the requesting user does not have the necessary permissions to access it.
 */
export const updateWorkflow = async (
  workflowId: string,
  data: UpdateWorkflowAPIRequestData["body"],
  user: User,
): Promise<Workflow> => {
  const db = await getDB();

  const workflow = await getWorkflow(workflowId, user.id, true);

  if (!workflow) {
    throw new NotFoundError(
      `Workflow with id ${workflowId} not found or you don't have permission to update it`,
    );
  }

  const requiresVersioning =
    data.serialisedReactFlow ||
    (typeof data.name === "string" &&
      data.name !== workflow.name &&
      data.name.length > 0);

  if (requiresVersioning) {
    await createWorkflowVersion(workflow, user, "Auto-saved before update");
  }

  if (
    typeof data.name === "string" &&
    data.name !== workflow.name &&
    data.name.length > 0
  ) {
    workflow.name = data.name;
  }

  if (data.serialisedReactFlow) {
    workflow.flowData = encryptData(JSON.stringify(data.serialisedReactFlow));
    workflow.currentVersion += 1;
  }

  if (
    typeof data.isActive === "boolean" &&
    data.isActive !== workflow.isActive
  ) {
    workflow.isActive = data.isActive;
  }

  if (data.config) {
    workflow.config = data.config;
  }

  if (data.category) {
    workflow.category = data.category;
  }

  db.persist(workflow);
  await db.flush();
  return workflow;
};

/**
 * Deletes a specific workflow by its ID if the user has permission to delete it.
 *
 * @param {string} workflowId - The unique identifier of the workflow to be deleted.
 * @param {User} user - The user attempting to delete the workflow; used to validate permissions.
 * @returns {Promise<void>} Resolves when the workflow has been successfully deleted.
 * @throws {NotFoundError} Throws an error if the workflow is not found or the user lacks permission to delete it.
 */
export const deleteWorkflow = async (
  workflowId: string,
  user: User,
): Promise<void> => {
  const db = await getDB();

  await db.transactional(async (tx) => {
    const workflowVersions = await tx.find(WorkflowVersion, {
      workflow: workflowId,
      user: user.id,
    });

    await tx.remove(workflowVersions).flush();

    const workflow = await getWorkflow(workflowId, user.id);

    if (workflow) {
      await tx.remove(workflow).flush();
    }
  });
};
