import { INodeVersion } from "../../types.js";
import { INodeProperty, NodePropertyOption } from "common";
import { modelProviders } from "../../../../ai/llm/provider/index.js";
import { validateNodePropertyInputSchema } from "../../utils.js";
import { agentConfigurationsPropertyInputSchema } from "../properties/agent/agent.config.property.js";
import { openAIModels } from "../../../../ai/llm/provider/openai.provider.js";
import { googleGenAIModels } from "../../../../ai/llm/provider/google.provider.js";
import { anthropicModels } from "../../../../ai/llm/provider/anthropic.provider.js";
import { deepSeekModels } from "../../../../ai/llm/provider/deepseek.provider.js";
import { getAdvancedModelSettingsProperties } from "../properties/agent/advanced.model.settings.properties.js";
import { getUserMCPInstallations } from "../../../../ai/mcp/crud/index.js";

export const agentLoadMethods: INodeVersion["loadMethods"] = {
  getModelProvidersList: async (
    _inputs,
  ): Promise<{
    options?: NodePropertyOption[];
    collection?: INodeProperty[];
  }> => {
    return {
      options: modelProviders,
    };
  },

  getModelsList: async (
    inputs,
  ): Promise<{
    options?: NodePropertyOption[];
    collection?: INodeProperty[];
  }> => {
    const validatedInputs = validateNodePropertyInputSchema({
      schema: agentConfigurationsPropertyInputSchema,
      inputs,
    });
    const provider =
      validatedInputs.agent_configurations.llm_configurations.model_provider;

    switch (provider) {
      case "openai":
        return { options: openAIModels as NodePropertyOption[] };
      case "google_gen_ai":
        return { options: googleGenAIModels as NodePropertyOption[] };
      case "anthropic":
        return { options: anthropicModels as NodePropertyOption[] };
      case "deepseek":
        return { options: deepSeekModels as NodePropertyOption[] };
      default:
        return { options: [] };
    }
  },

  getAdvancedModelSettings: async (
    _inputs,
  ): Promise<{
    options?: NodePropertyOption[];
    collection?: INodeProperty[];
  }> => {
    return {
      collection: getAdvancedModelSettingsProperties(),
    };
  },

  getModelProviderCredential: async (
    inputs,
  ): Promise<{
    options?: NodePropertyOption[];
    collection?: INodeProperty[];
    credentialName?: string;
  }> => {
    const validatedInputs = validateNodePropertyInputSchema({
      schema: agentConfigurationsPropertyInputSchema,
      inputs,
    });
    const provider =
      validatedInputs.agent_configurations.llm_configurations.model_provider;

    switch (provider) {
      case "openai":
        return { credentialName: "openai" };
      case "google_gen_ai":
        return { credentialName: "google_gen_ai" };
      case "anthropic":
        return { credentialName: "anthropic" };
      case "deepseek":
        return { credentialName: "deepseek" };
      case "openrouter":
        return { credentialName: "openrouter" };
      default:
        return {};
    }
  },

  getUserMCPInstallations: async (
    _inputs,
    context,
  ): Promise<{
    options?: NodePropertyOption[];
    collection?: INodeProperty[];
  }> => {
    if (!context?.user || !context.db) {
      return { options: [] };
    }

    try {
      const installations = await getUserMCPInstallations({
        db: context.db,
        userId: context.user.id,
      });

      const options: NodePropertyOption[] = installations
        .filter((installation) => installation.status === "enabled")
        .map((installation) => ({
          name: installation.id,
          label: installation.name,
          description:
            installation.description || installation.serverInfo?.description,
        }));

      return { options };
    } catch {
      return { options: [] };
    }
  },
};
