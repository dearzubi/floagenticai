import { INodeCredential, NodeCredentialNames } from "common";
import { GoogleAICredentials } from "./googleai-credentials/googleai.credentials.js";
import { OpenAICredentials } from "./openai-credentials/openai.credentials.js";
import { EVMPrivateKeyCredentials } from "./evm-pk-credentials/evm-pk.credentials.js";
import { RPCCredentials } from "./rpc-credentials/rpc.credentials.js";
import { OneInchCredentials } from "./oneinch-credentials/oneinch.credentials.js";
import { AnthropicCredentials } from "./anthropic-credentials/anthropic.credentials.js";
import { DeepseekCredentials } from "./deepseek-credentials/deepseek.credentials.js";
import { OpenRouterCredentials } from "./openrouter-credentials/openrouter.credentials.js";
import { LinkupCredentials } from "./linkup-credentials/linkup.credentials.js";
import { PerplexityCredentials } from "./perplexity-credentials/perplexity.credentials.js";
import { EverArtCredentials } from "./everart-credentials/everart.credentials.js";
import { BraveCredentials } from "./brave-credentials/brave.credentials.js";
import { GoogleMapsCredentials } from "./google-maps-credentials/google.maps.credentials.js";

export const nodeCredentials: Record<NodeCredentialNames, INodeCredential> = {
  openai: new OpenAICredentials(),
  google_gen_ai: new GoogleAICredentials(),
  anthropic: new AnthropicCredentials(),
  deepseek: new DeepseekCredentials(),
  openrouter: new OpenRouterCredentials(),
  evm_pk_credentials: new EVMPrivateKeyCredentials(),
  rpc_credentials: new RPCCredentials(),
  oneinch_credentials: new OneInchCredentials(),
  linkup_credentials: new LinkupCredentials(),
  perplexity_credentials: new PerplexityCredentials(),
  everart_credentials: new EverArtCredentials(),
  brave_credentials: new BraveCredentials(),
  google_maps_credentials: new GoogleMapsCredentials(),
};
