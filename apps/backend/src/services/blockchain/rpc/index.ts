import { RPCProviders, SupportedNetworks } from "./types.js";
import { RPC_ENDPOINTS } from "./constants.js";

/**
 * Get the RPC endpoint for a given network and provider
 * @param network - The network to get the RPC endpoint for
 * @param provider - The provider to get the RPC endpoint for
 * @param apiKey - The API key for the provider
 * @param quickNodeEndpointName - The QuickNode endpoint name; only required for QuickNode provider
 * @returns The RPC endpoint URL for the given network and provider or undefined if the endpoint is not found
 */
export const getRPCEndpoint = (
  network: SupportedNetworks,
  provider: RPCProviders,
  apiKey: string,
  quickNodeEndpointName?: string,
): string | undefined => {
  const providerEndpoints = RPC_ENDPOINTS.get(provider);
  let endpoint = providerEndpoints?.[network];
  if (!endpoint) {
    return;
  }

  endpoint = endpoint.replaceAll("{{apiKey}}", apiKey);

  if (provider === "quicknode" && quickNodeEndpointName) {
    endpoint = endpoint.replaceAll(
      "{{endpointName}}",
      quickNodeEndpointName.toLowerCase(),
    );
  }

  return endpoint;
};
