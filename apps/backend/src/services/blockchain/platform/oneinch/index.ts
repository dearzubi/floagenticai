import { InitialiseOneInchServiceArgs } from "./types.js";
import {
  validateOneInchAPIKey,
  validateOneInchNetworkToUse,
  getOneInchAPIHttpClient,
} from "./utils.js";
import { ViemClients } from "../../network/evm/client/viem/types.js";
import { getViemClients } from "../../network/evm/client/viem/viem.client.js";
import { getRPCEndpoint } from "../../rpc/index.js";
import { HttpClient } from "../../../../utils/http/client.js";
import { Quotation } from "./modules/quotation.js";
import { Swap } from "./modules/swap.js";
import { LimitOrders } from "./modules/limit-orders/index.js";

export class OneInchService {
  public oneInchAPIKey: string;
  public clients: ViemClients;
  public httpClient: HttpClient;
  public quote: Quotation;
  public swap: Swap;
  public limitOrders: LimitOrders;

  private constructor(
    oneInchAPIKey: string,
    clients: ViemClients,
    httpClient: HttpClient,
  ) {
    this.oneInchAPIKey = oneInchAPIKey;
    this.clients = clients;
    this.httpClient = httpClient;
    this.quote = new Quotation(this);
    this.swap = new Swap(this);
    this.limitOrders = new LimitOrders(this);
  }

  public static async init({
    oneInchApiKey,
    network,
    enabledNetworks,
    signerAccount,
    rpcProvider,
  }: InitialiseOneInchServiceArgs): Promise<OneInchService> {
    const validatedOneInchAPIKey = validateOneInchAPIKey(oneInchApiKey);
    const validatedNetwork = validateOneInchNetworkToUse(
      network,
      enabledNetworks,
    );

    let rpcEndpointURL: string | undefined;

    if (rpcProvider) {
      rpcEndpointURL = getRPCEndpoint(
        validatedNetwork,
        rpcProvider.provider,
        rpcProvider.apiKey,
        rpcProvider.quickNodeEndpointName,
      );
    }

    const clients = signerAccount
      ? getViemClients({
          network,
          account: signerAccount,
          rpcEndpoint: rpcEndpointURL,
        })
      : getViemClients({
          network,
          rpcEndpoint: rpcEndpointURL,
        });

    const httpClient = getOneInchAPIHttpClient({
      chainId: await clients.publicClient.getChainId(),
      oneInchApiKey: validatedOneInchAPIKey,
      oneInchApiVersion: "6.0",
    });

    return new OneInchService(validatedOneInchAPIKey, clients, httpClient);
  }

  /**
   * Sets the API key for the 1Inch service.
   * @param oneInchAPIKey - The new API key to set.
   * @throws {Error} If the API key is invalid or empty.
   */
  public setAPIKey(oneInchAPIKey: string): void {
    this.oneInchAPIKey = validateOneInchAPIKey(oneInchAPIKey);
  }
}
