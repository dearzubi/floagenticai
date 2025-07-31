import { z } from "zod/v4";
import { z as zodv3 } from "zod";
import {
  credentialsSchema as agentCredentialsSchema,
  inputSchema as agentInputSchema,
} from "../../agent/v1/schemas.js";

export const conditionSchema = z.object({
  id: z.string(),
  name: z.string(),
  expression: z.string(),
});

export type Condition = z.infer<typeof conditionSchema>;

export const inputSchema = agentInputSchema
  .pick({
    model_provider: true,
    openai_model_settings: true,
    google_gen_ai_model_settings: true,
  })
  .extend({
    conditions: z
      .array(conditionSchema)
      .nullish()
      .transform((v) => v ?? [])
      .pipe(z.array(conditionSchema).min(1)),
    default_condition: z
      .string()
      .nullish()
      .transform((v) => v ?? undefined)
      .describe("ID of the default condition if no conditions match"),
  });

export const credentialsSchema = agentCredentialsSchema;

export const outputSchema = z.object({
  contextToForward: z.string(),
  selectedCondition: z.object({
    id: z.string(),
    name: z.string(),
  }),
  evaluationResults: z.array(
    z.object({
      conditionId: z.string(),
      conditionName: z.string(),
      result: z.boolean(),
    }),
  ),
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
