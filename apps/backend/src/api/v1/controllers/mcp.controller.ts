import { NextFunction, Request, Response } from "express";

import {
  MCPInstallationCreate,
  MCPInstallationUpdate,
  MCPInstallationId,
} from "../schemas/mcp.schemas.js";
import { User } from "../../../database/entities/user.entity.js";
import { getDB } from "../../../database/init.js";
import {
  createMCPInstallation,
  deleteMCPInstallation,
  getMCPCategories,
  getMCPInstallation,
  getMCPServersList,
  getUserMCPInstallations,
  updateMCPInstallation,
} from "../../../services/ai/mcp/crud/index.js";

export const getMCPServersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;

    res.json(
      getMCPServersList({
        page,
        limit,
        searchTerm: search,
        category,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getMCPCategoriesController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.json({ categories: getMCPCategories() });
  } catch (error) {
    next(error);
  }
};

export const getUserMCPInstallationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.json(
      await getUserMCPInstallations({
        db: await getDB(),
        userId: (req.user as User).id,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const installMCPServerController = async (
  req: Request<{}, {}, MCPInstallationCreate>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.status(201).json(
      await createMCPInstallation({
        user: req.user as User,
        data: req.body,
        db: await getDB(),
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const updateMCPInstallationController = async (
  req: Request<MCPInstallationId, {}, MCPInstallationUpdate>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.json(
      await updateMCPInstallation({
        data: req.body,
        installationId: req.params.id,
        user: req.user as User,
        db: await getDB(),
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const deleteMCPInstallationController = async (
  req: Request<MCPInstallationId>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await deleteMCPInstallation({
      userId: (req.user as User).id,
      installationId: req.params.id,
      db: await getDB(),
    });

    res.json({ message: "MCP installation deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getMCPInstallationController = async (
  req: Request<MCPInstallationId>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.json(
      await getMCPInstallation({
        db: await getDB(),
        userId: (req.user as User).id,
        installationId: req.params.id,
      }),
    );
  } catch (error) {
    next(error);
  }
};
