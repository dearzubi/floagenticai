import { z } from "zod/v4";
import { z as zodv3 } from "zod";
import { inputSchema as agentInputSchema } from "../../agent/v1/schemas.js";
import { toolNames } from "./constants.js";
import { openAICredentialsSchema } from "../../../../../credentials/credentials/openai-credentials/schemas.js";
import { googleAICredentialsSchema } from "../../../../../credentials/credentials/googleai-credentials/schemas.js";
import { evmPrivateKeyCredentialsSchema } from "../../../../../credentials/credentials/evm-pk-credentials/schemas.js";
import { rpcCredentialsSchema } from "../../../../../credentials/credentials/rpc-credentials/schemas.js";
import { oneInchAICredentialsSchema } from "../../../../../credentials/credentials/oneinch-credentials/schemas.js";
import { supportedNetworks } from "../../../../../blockchain/platform/oneinch/constants.js";
import { walletTypes } from "../../../../../blockchain/wallet/constants.js";

const toolSchema = z
  .array(z.enum(Array.from(toolNames.keys())))
  .nullish()
  .transform((v) => v ?? undefined);

export const inputSchema = agentInputSchema
  .pick({
    model_provider: true,
    openai_model_settings: true,
    google_gen_ai_model_settings: true,
    instructions: true,
    enable_memory: true,
  })
  .extend({
    networks: z
      .array(z.enum(Array.from(supportedNetworks.keys())))
      .nullish()
      .transform((v) => v ?? undefined),
    tools: toolSchema,
    toolsNeedApproval: toolSchema,
    wallet: z.object({
      wallet_type: z.enum(Array.from(walletTypes.keys())),
    }),
  });

export type ValidatedInputs = z.infer<typeof inputSchema>;

export const credentialsSchema = z
  .array(
    z.union([
      openAICredentialsSchema,
      googleAICredentialsSchema,
      evmPrivateKeyCredentialsSchema,
      rpcCredentialsSchema,
      oneInchAICredentialsSchema,
    ]),
  )
  .nonempty({ error: "Missing model or other required credentials." });

export const outputSchema = z.object({
  quotationResult: z
    .object({
      amountToSwap: z.string(),
      quotedAmount: z.string(),
      routes: z.array(
        z.array(
          z.array(
            z.object({
              fromTokenAddress: z.string(),
              toTokenAddress: z.string(),
              name: z.string(),
              part: z.number(),
            }),
          ),
        ),
      ),
    })
    .optional(),
  swapResult: z
    .object({
      fromTokenAddress: z.string(),
      toTokenAddress: z.string(),
      amountIn: z.string(),
      amountOut: z.string(),
      tx: z.string(),
    })
    .optional(),
  limitOrderResult: z
    .object({
      orderHash: z.string(),
      fromTokenAddress: z.string(),
      toTokenAddress: z.string(),
      amountIn: z.string(),
      amountOut: z.string(),
      tx: z.string(),
    })
    .optional(),
});

export type OutputsShape = z.infer<typeof outputSchema>;

export const outputStructureSchema = zodv3.object({
  selectedConditionId: zodv3
    .string()
    .describe("The ID of the selected condition"),
  selectedConditionName: zodv3
    .string()
    .describe("The name of the selected condition"),
  evaluationResults: zodv3
    .array(
      zodv3.object({
        conditionId: zodv3.string(),
        conditionName: zodv3.string(),
        result: zodv3.boolean(),
      }),
    )
    .describe("Evaluation results for each condition"),
  reasoning: zodv3.string().describe("Detailed reasoning for the selection"),
});
