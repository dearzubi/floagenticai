import { z } from "zod/v4";

export const chatListAPIResponseSchema = z.array(
  z.object({
    id: z.string().nonempty(),
    workflowId: z.string().nonempty(),
    nodeData: z.object({
      nodeId: z.string().nonempty().nullish(),
      friendlyName: z.string().nullish(),
    }),
    role: z.enum(["user", "assistant"]),
    status: z.enum(["thinking", "generating", "completed", "error"]),
    content: z.string(),
    artifacts: z.object({
      agentToolCalls: z
        .array(
          z.object({
            toolName: z.string().nonempty(),
            toolInput: z.record(z.string(), z.unknown()),
            toolOutput: z.string(),
            toolIcon: z.string().optional(),
          }),
        )
        .optional(),
      agentToolApprovals: z
        .array(
          z.object({
            arguments: z.string(),
            callId: z.string(),
            id: z.string().optional(),
            name: z.string(),
            providerData: z.record(z.string(), z.unknown()).optional(),
            status: z
              .enum(["in_progress", "completed", "incomplete"])
              .optional(),
            type: z.literal("function_call"),
            actionStatus: z.enum(["pending", "approved", "rejected"]),
            nodeId: z.string(),
          }),
        )
        .optional(),
    }),
    createdAt: z.string().nonempty(),
    updatedAt: z.string().nonempty(),
    userId: z.string(),
    sessionId: z.string(),
    executionId: z.string().nullish(),
  }),
);

export type ChatListAPIResponse = z.infer<typeof chatListAPIResponseSchema>;

export const deleteChatAPIResponseSchema = z.object({
  message: z.string().nonempty(),
});

export type DeleteChatAPIResponse = z.infer<typeof deleteChatAPIResponseSchema>;
