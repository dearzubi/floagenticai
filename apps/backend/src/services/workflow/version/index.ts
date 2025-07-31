import { WorkflowVersion } from "../../../database/entities/workflow-version.entity.js";
import { Workflow } from "../../../database/entities/workflow.entity.js";
import { User } from "../../../database/entities/user.entity.js";
import { v4 as uuidv4 } from "uuid";
import { decryptData } from "../../../utils/encryption.js";
import { getDB } from "../../../database/init.js";
import { NotFoundError } from "../../../utils/errors/notfound.error.js";
import { ValidationError } from "../../../utils/errors/validation.error.js";
import { logger } from "../../../utils/logger/index.js";

/**
 * Creates a new version of a workflow by saving the current state as a version history entry.
 *
 * @param workflow - The workflow to create a version for
 * @param user - The user creating the version
 * @param description - Optional description for this version
 * @returns Promise<WorkflowVersion> - The created workflow version
 */
export const createWorkflowVersion = async (
  workflow: Workflow,
  user: User,
  description?: string,
): Promise<WorkflowVersion> => {
  const db = await getDB();

  const workflowVersion = db.create(WorkflowVersion, {
    id: uuidv4(),
    version: workflow.currentVersion,
    name: workflow.name,
    flowData: workflow.flowData, // Already encrypted
    config: workflow.config,
    category: workflow.category,
    description: description,
    workflow: workflow,
    user: user,
  });

  await db.flush();
  return workflowVersion;
};

/**
 * Retrieves all versions of a specific workflow.
 *
 * @param workflowId - The ID of the workflow
 * @param userId - The user ID to verify ownership
 * @param keepFlowDataEncrypted - Whether to keep flow data encrypted (default: true for list view)
 * @param page - The page number for pagination (default: 1)
 * @param limit - The number of items per page (default: 10)
 * @returns Promise<WorkflowVersion[]> - Array of workflow versions
 */
export const getWorkflowVersions = async (
  workflowId: string,
  userId: string,
  keepFlowDataEncrypted = true,
  page = 1,
  limit = 10,
): Promise<WorkflowVersion[]> => {
  const db = await getDB();

  const _page = page || 1;
  const _limit = limit || 10;

  const versions = await db.find(
    WorkflowVersion,
    {
      workflow: workflowId,
      user: userId,
    },
    {
      offset: (_page - 1) * _limit,
      limit: _limit,
      orderBy: { version: "DESC" },
      populate: ["workflow"],
    },
  );

  if (!keepFlowDataEncrypted) {
    const returnVersions: WorkflowVersion[] = [];

    for (const version of versions) {
      const decryptedData = decryptData(version.flowData);
      if (!decryptedData.ok) {
        logger.warn(
          `Workflow version ${version.id} of workflow ${workflowId} is corrupted`,
        );
        continue;
      }
      version.flowData = decryptedData.plainText;
      returnVersions.push(version);
    }

    return returnVersions;
  }

  return versions;
};

/**
 * Retrieves a specific version of a workflow.
 *
 * @param workflowId - The ID of the workflow
 * @param version - The version number to retrieve
 * @param userId - The user ID to verify ownership
 * @param keepFlowDataEncrypted - Whether to keep flow data encrypted (default: false)
 * @returns Promise<WorkflowVersion> - The workflow version
 */
export const getWorkflowVersion = async (
  workflowId: string,
  version: number,
  userId: string,
  keepFlowDataEncrypted = false,
): Promise<WorkflowVersion> => {
  const db = await getDB();

  const workflowVersion = await db.findOne(
    WorkflowVersion,
    {
      workflow: workflowId,
      version: version,
      user: userId,
    },
    {
      populate: ["workflow"],
    },
  );

  if (!workflowVersion) {
    throw new NotFoundError(
      `Workflow version ${version} for workflow ${workflowId} not found`,
    );
  }

  if (!keepFlowDataEncrypted) {
    const decryptedData = decryptData(workflowVersion.flowData);

    if (!decryptedData.ok) {
      throw new ValidationError(
        `Workflow version ${version} for workflow ${workflowId} is corrupted`,
      );
    }

    workflowVersion.flowData = decryptedData.plainText;
  }

  return workflowVersion;
};

/**
 * Restores a specific version of a workflow as the current version.
 * This creates a new version from the current state before restoring.
 *
 * @param workflowId - The ID of the workflow
 * @param versionToRestore - The version number to restore
 * @param user - The user performing the restore
 * @param description - Optional description for the backup version created
 * @returns Promise<Workflow> - The updated workflow
 */
export const restoreWorkflowVersion = async (
  workflowId: string,
  versionToRestore: number,
  user: User,
  description?: string,
): Promise<Workflow> => {
  const db = await getDB();

  const currentWorkflow = await db.findOne(Workflow, {
    id: workflowId,
    user: user.id,
  });

  if (!currentWorkflow) {
    throw new NotFoundError(
      `Workflow ${workflowId} not found or you don't have permission to access it`,
    );
  }

  const versionToRestoreData = await getWorkflowVersion(
    workflowId,
    versionToRestore,
    user.id,
    true, // Keep encrypted for direct assignment
  );

  // Create a version from the current state before restoring
  await createWorkflowVersion(
    currentWorkflow,
    user,
    description || `Backup before restoring to version ${versionToRestore}`,
  );

  // Update the current workflow with the restored version data
  currentWorkflow.name = versionToRestoreData.name;
  currentWorkflow.flowData = versionToRestoreData.flowData;
  currentWorkflow.config = versionToRestoreData.config;
  currentWorkflow.category = versionToRestoreData.category;
  currentWorkflow.currentVersion = currentWorkflow.currentVersion + 1;

  db.persist(currentWorkflow);
  await db.flush();

  return currentWorkflow;
};

/**
 * Deletes a specific version of a workflow.
 *
 * @param workflowId - The ID of the workflow
 * @param version - The version number to delete
 * @param userId - The user ID to verify ownership
 * @returns Promise<void>
 */
export const deleteWorkflowVersion = async (
  workflowId: string,
  version: number,
  userId: string,
): Promise<void> => {
  const db = await getDB();

  const workflowVersion = await db.findOne(WorkflowVersion, {
    workflow: workflowId,
    version: version,
    user: userId,
  });

  if (!workflowVersion) {
    throw new NotFoundError(
      `Workflow version ${version} for workflow ${workflowId} not found or you don't have permission to delete it`,
    );
  }

  await db.remove(workflowVersion).flush();
};
