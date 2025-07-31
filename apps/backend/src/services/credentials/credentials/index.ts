import { INodeCredential, NodeCredentialNames } from "common";
import { GoogleAICredentials } from "./googleai-credentials/googleai.credentials.js";
import { OpenAICredentials } from "./openai-credentials/openai.credentials.js";
import { EVMPrivateKeyCredentials } from "./evm-pk-credentials/evm-pk.credentials.js";
import { RPCCredentials } from "./rpc-credentials/rpc.credentials.js";
import { OneInchCredentials } from "./oneinch-credentials/oneinch.credentials.js";

export const nodeCredentials: Record<NodeCredentialNames, INodeCredential> = {
  open_ai_credentials: new OpenAICredentials(),
  google_ai_credentials: new GoogleAICredentials(),
  evm_pk_credentials: new EVMPrivateKeyCredentials(),
  rpc_credentials: new RPCCredentials(),
  oneinch_credentials: new OneInchCredentials(),
};
