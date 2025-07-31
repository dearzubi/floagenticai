import express, { Router } from "express";
import {
  getChatListController,
  clearWorkflowChatController,
  deleteChatMessageController,
} from "../controllers/chat.controllers.js";
import { schemaValidationMiddleware } from "../middlewares/schema-validation.middleware.js";
import { chatAPIRequestSchemas } from "../schemas/chat.schemas.js";

const router: Router = express.Router();

router.get(
  "/",
  (req, res, next) =>
    schemaValidationMiddleware(
      chatAPIRequestSchemas.getChatList,
      req,
      res,
      next,
    ),
  getChatListController,
);

router.delete(
  "/clear",
  (req, res, next) =>
    schemaValidationMiddleware(
      chatAPIRequestSchemas.clearWorkflowChat,
      req,
      res,
      next,
    ),
  clearWorkflowChatController,
);

router.delete(
  "/:chatId",
  (req, res, next) =>
    schemaValidationMiddleware(
      chatAPIRequestSchemas.deleteChatMessage,
      req,
      res,
      next,
    ),
  deleteChatMessageController,
);

export default router;
