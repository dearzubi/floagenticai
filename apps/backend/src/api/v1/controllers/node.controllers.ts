import { Request, Response, NextFunction } from "express";
import {
  workflowNodes,
  workflowNodesMap,
} from "../../../services/workflow/node/index.js";
import { ValidationError } from "../../../utils/errors/validation.error.js";
import { LoadMethodAPIRequestData } from "../schemas/node.schemas.js";
import { NodeNames } from "common";
import { User } from "../../../database/entities/user.entity.js";
import { getDB } from "../../../database/init.js";

/**
 * List all workflow nodes
 */
export const listAllNodesController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const serialisedNodes = Object.values(workflowNodes)
      .flatMap((category) => Object.values(category))
      .map((node) => node.toJSON());

    res.json(serialisedNodes);
  } catch (error) {
    next(error);
  }
};

export const loadMethodController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { nodeName, methodName, inputs, version } =
      req.body as LoadMethodAPIRequestData["body"];

    const nodeInstance = workflowNodesMap.get(nodeName as NodeNames);

    if (!nodeInstance) {
      throw new ValidationError(`Node ${nodeName} not found`);
    }

    const nodeVersion = nodeInstance.getNodeVersion(version);
    if (!nodeVersion || !nodeVersion.loadMethods) {
      throw new ValidationError(
        `Node ${nodeName} does not support load methods`,
      );
    }

    const loadMethod = nodeVersion.loadMethods[methodName];
    if (!loadMethod) {
      throw new ValidationError(
        `Load method ${methodName} not found for node ${nodeName}`,
      );
    }

    const result = await loadMethod(inputs, {
      db: await getDB(),
      user: req.user as User,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};
