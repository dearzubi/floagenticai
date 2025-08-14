import { AiSdkModel } from "@openai/agents-extensions";
import {
  AgentOutputType,
  ModelSettings,
  Tool,
  UnknownContext,
} from "@openai/agents";
import { AgentArtifacts, ModelProviders } from "common";
import { CredentialData } from "../../credentials/crud/types.js";

export type CreateAgentOptions<TContext = UnknownContext> = {
  name: string;
  model: {
    model: string | AiSdkModel;
    settings?: ModelSettings & {
      enableMemory?: boolean;
      enableStreaming?: boolean;
    };
    provider?: {
      name: ModelProviders;
      credential: string | CredentialData;
    };
  };
  instructions?: string;
  inputMessage?: string;
  outputType?: AgentOutputType;
  tools?: Tool<TContext>[];
};

export type AgentOutputs<
  SOutput extends Record<string, unknown> | unknown = Record<string, unknown>,
  additionalData extends Record<string, unknown> = Record<string, unknown>,
> = {
  type: "agent";
  finalOutput?: string;
  structuredOutput?: SOutput;
  artifacts?: AgentArtifacts;
  forwardedContext?: string;
  additionalData?: additionalData;
};

export type AgentToolFactory<Context = unknown> = (options?: {
  needsApproval?: boolean;
}) => Tool<Context>;
