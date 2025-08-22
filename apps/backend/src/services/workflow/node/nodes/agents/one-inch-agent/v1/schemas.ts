import { z } from "zod/v4";
import { toolNames } from "./constants.js";
import { supportedNetworks } from "../../../../../../blockchain/platform/oneinch/constants.js";
import { agentConfigurationsPropertyInputSchema } from "../../../../property/properties/agent/agent.config.property.js";

const toolNamesSchema = z
  .array(z.enum(Array.from(toolNames.keys())), {
    error: "Please select 1Inch tools from the list.",
  })
  .nullish()
  .transform((v) => v ?? undefined);

export const nodePropertyInputSchema =
  agentConfigurationsPropertyInputSchema.extend({
    oneinch_configurations: z.object({
      tools: toolNamesSchema,
      toolsNeedApproval: toolNamesSchema,
      networks: z
        .array(z.enum(Array.from(supportedNetworks.keys())))
        .nullish()
        .transform((v) => v ?? undefined),
    }),
  });
