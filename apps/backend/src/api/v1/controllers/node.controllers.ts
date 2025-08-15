import { Request, Response, NextFunction } from "express";
import { workflowNodes } from "../../../services/workflow/node/index.js";

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
