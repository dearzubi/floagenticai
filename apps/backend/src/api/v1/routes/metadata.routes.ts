import { Router } from "express";
import { getVersion } from "../controllers/metadata.controller.js";

const router: Router = Router();

/**
 * @route GET /api/v1/metadata/version
 * @desc Get version information only
 * @access Public
 */
router.get("/version", getVersion);

export default router;
