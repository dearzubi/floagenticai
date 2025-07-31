import { ChatListAPIResponse } from "../../../../../apis/chat/schemas.ts";
import { AgentArtifacts } from "common";

export type ChatMessage = {
  id: string;
  content: string;
  sender: ChatListAPIResponse[number]["role"];
  nodeId?: string;
  executionId?: string | null;
  sessionId: string;
  timestamp: Date;
  status?: ChatListAPIResponse[number]["status"];
  artifacts?: AgentArtifacts | null;
};
