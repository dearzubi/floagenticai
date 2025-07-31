import { OneInchService } from "../index.js";
import { OneInchQuotationArgs } from "./types.js";
import { getERC20TokenInfo } from "../../../token/erc20/utils.js";
import { validateOneInchTokenAmount } from "../utils.js";
import { z } from "zod/v4";
import { formatUnits } from "viem";

const oneInchQuotationSchema = z.object({
  dstAmount: z.string(),
  protocols: z.array(
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
});

export type OneInchQuotation = z.infer<typeof oneInchQuotationSchema>;

export class Quotation {
  constructor(private service: OneInchService) {}

  /**
   * Get token swap quotation from 1Inch API.
   * @param sellToken The address or symbol of the token to sell.
   * @param buyToken The address or symbol of the token to buy.
   * @param amount The amount of sellToken to swap.
   */
  async get({
    sellToken,
    buyToken,
    amount,
  }: OneInchQuotationArgs): Promise<OneInchQuotation> {
    const publicClient = this.service.clients.publicClient;
    const chainId = await publicClient.getChainId();

    const [tokenIn, tokenOut] = await Promise.all([
      getERC20TokenInfo(sellToken, publicClient),
      getERC20TokenInfo(buyToken, publicClient),
    ]);
    const amounts = validateOneInchTokenAmount(amount, tokenIn.decimals);

    const amountIn = amounts.amountBigInt;

    const quote = await this.service.httpClient.get<OneInchQuotation>(
      "/quote",
      {
        params: {
          src: tokenIn.address,
          dst: tokenOut.address,
          amount: amountIn.toString(),
          includeProtocols: true,
        },
        retry: {
          attempts: 5,
        },
        cache: {
          enabled: true,
          ttl: 30,
          key: `oneinch-quotation-${chainId}-${tokenIn.address}-${tokenOut.address}-${amountIn.toString()}`,
        },
        schema: oneInchQuotationSchema,
      },
    );

    quote.dstAmount = formatUnits(BigInt(quote.dstAmount), tokenOut.decimals);

    return quote;
  }
}
