import { v4 as uuidv4 } from "uuid";
import { decryptData, encryptData } from "../../../utils/encryption.js";
import { User } from "../../../database/entities/user.entity.js";
import { getDB } from "../../../database/init.js";
import { ValidationError } from "../../../utils/errors/validation.error.js";
import { logger } from "../../../utils/logger/index.js";
import {
  Chat,
  ChatSenderRole,
  ChatStatus,
} from "../../../database/entities/chat.entity.js";
import { AgentMemory } from "../../../database/entities/agent-memory.entity.js";

/**
 * Decrypts and sanitizes the chat message content and artifacts
 * @param {Chat} chat - The db chat record
 */
const decryptAndSanitizeChat = (chat: Chat): Chat => {
  const decryptedContent = decryptData(chat.content);
  if (!decryptedContent.ok) {
    throw new ValidationError(`Chat with id ${chat.id} is corrupted`);
  }
  chat.content = decryptedContent.plainText;

  if (chat.artifacts) {
    const decryptedArtifacts = decryptData(chat.artifacts);
    if (!decryptedArtifacts.ok) {
      throw new ValidationError(`Chat with id ${chat.id} is corrupted`);
    }
    chat.artifacts = decryptedArtifacts.plainText;
  }

  return chat;
};

type ChatMessage = {
  id?: string; // Optional ID for upsert
  workflowId: string;
  nodeData: string;
  role: ChatSenderRole;
  status: ChatStatus;
  content: string;
  artifacts?: string;
  executionId?: string;
  sessionId: string;
};

/**
 * Creates a new chat message and saves it to the database.
 * @param {ChatMessage} data - The body data required to create the chat message.
 * @param {User} user - The user entity associated with this chat message creation.
 * @returns {Promise<Chat>} A promise that resolves to the newly created chat message entity.
 */
export const createChatMessage = async (
  data: ChatMessage,
  user: User | string,
): Promise<Chat> => {
  const db = await getDB();

  if (data.id) {
    const chat = await db.findOne(Chat, {
      id: data.id,
    });

    if (chat) {
      chat.nodeData = data.nodeData;
      chat.content = encryptData(data.content);
      chat.artifacts = data.artifacts ? encryptData(data.artifacts) : undefined;
      await db.persist(chat).flush();
      return chat;
    }
  }

  const chat = db.create(Chat, {
    id: uuidv4(),
    workflowId: data.workflowId,
    nodeData: data.nodeData,
    role: data.role as ChatSenderRole,
    status: data.status as ChatStatus,
    content: encryptData(data.content),
    artifacts: data.artifacts ? encryptData(data.artifacts) : undefined,
    sessionId: data.sessionId,
    executionId: data.executionId,
    user: user,
  });

  await db.flush();

  return chat;
};

/**
 * Retrieves a list of chat messages for a user. The response is paginated and sorted by createdAt in descending order.
 *
 * @param {string} workflowId - The ID of the workflow
 * @param {number} page - The page number
 * @param {number} limit - The number of items per page
 * @param {string} userId - The ID of the user
 * @returns {Promise<Chat[]>} A promise that resolves to an array of chat messages
 */
export const getChat = async (
  workflowId: string,
  page: number,
  limit: number,
  userId: string,
): Promise<Chat[]> => {
  const db = await getDB();

  const _page = page || 1;
  const _limit = limit || 10;

  const chats = await db.find(
    Chat,
    {
      user: userId,
      workflowId,
    },
    {
      offset: (_page - 1) * _limit,
      limit: _limit,
      orderBy: { createdAt: "DESC" },
    },
  );

  const returnChats: Chat[] = [];

  for (const chat of chats) {
    try {
      returnChats.push(decryptAndSanitizeChat(chat));
    } catch (error) {
      logger.warn(`Chat with id ${chat.id} of user ${userId} is corrupted`);
    }
  }

  return returnChats;
};

/**
 * Deletes a chat message from the database for a specific user
 * @param {string} chatId - The ID of the chat message
 * @param {string} userId - The ID of the user
 */
export const deleteChatMessage = async (
  chatId: string,
  userId: string,
): Promise<void> => {
  const db = await getDB();

  const chat = await db.findOne(Chat, {
    id: chatId,
    user: userId,
  });

  if (!chat) {
    return;
  }

  await db.remove(chat).flush();
};

/**
 * Deletes all chat messages from the database for a specific workflow and user and clear agents memory in that workflow
 * @param {string} workflowId - The ID of the workflow
 * @param {string} userId - The ID of the user
 */
export const clearWorkflowChat = async (
  workflowId: string,
  userId: string,
): Promise<void> => {
  const db = await getDB();

  await db.transactional(async (tx) => {
    const [chats, agentMemories] = await Promise.all([
      db.find(Chat, {
        workflowId: workflowId,
        user: userId,
      }),
      db.find(AgentMemory, {
        workflowId: workflowId,
        sessionId: userId,
      }),
    ]);

    await tx.remove(chats).flush();
    await tx.remove(agentMemories).flush();
  });
};
