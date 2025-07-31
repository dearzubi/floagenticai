import { LimitOrderApiItem } from "@1inch/limit-order-sdk";
import { formatUnits, PublicClient } from "viem";
import { FormattedLimitOrder } from "./types.js";
import { getERC20TokenInfo } from "../../../../token/erc20/utils.js";

const ORDER_STATUS: Record<number, string> = {
  1: "Valid",
  2: "Temporarily Invalid",
  3: "Invalid",
};

/**
 * Formats a given limit order by enriching it with additional details
 * such as token information, formatted amounts, and calculated expiry time.
 *
 * @param {LimitOrderApiItem} order - The order object containing data about the limit order.
 * @param {PublicClient} publicClient - The public client instance used to fetch token details.
 * @returns {Promise<FormattedLimitOrder>} A promise that resolves to an object containing formatted order details, including:
 *  - walletAddress: The maker's wallet address (as AddressType).
 *  - orderHash: The unique hash of the order.
 *  - createDateTime: The creation date and time of the order.
 *  - sellToken: The symbol of the token being sold.
 *  - buyToken: The symbol of the token being bought.
 *  - sellAmount: The formatted amount of the token being sold, adjusted for token decimals.
 *  - buyAmount: The formatted amount of the token being bought, adjusted for token decimals.
 *  - Expiry details from `calculateOrderExpiryTime` function.
 */
export const formatLimitOrder = async (
  order: LimitOrderApiItem,
  publicClient: PublicClient,
): Promise<FormattedLimitOrder> => {
  const [sellToken, buyToken] = await Promise.all([
    getERC20TokenInfo(order.data.makerAsset, publicClient),
    getERC20TokenInfo(order.data.takerAsset, publicClient),
  ]);

  const sellAmount = formatUnits(
    BigInt(order.data.makingAmount),
    sellToken.decimals,
  );

  const buyAmount = formatUnits(
    BigInt(order.data.takingAmount),
    buyToken.decimals,
  );

  return {
    walletAddress: order.data.maker,
    orderHash: order.orderHash,
    createDateTime: order.createDateTime,
    lastChangedDateTime:
      "lastChangedDateTime" in order
        ? (order.lastChangedDateTime as string)
        : undefined,
    expiryDateTime: extractExpiryDateTime(order.data.makerTraits),
    sellToken: sellToken.symbol,
    sellTokenAddress: sellToken.address,
    buyTokenAddress: buyToken.address,
    buyToken: buyToken.symbol,
    sellAmount: sellAmount,
    remainingSellAmount: formatUnits(
      BigInt(order.remainingMakerAmount),
      sellToken.decimals,
    ),
    buyAmount: buyAmount,
    status:
      "orderStatus" in order
        ? ORDER_STATUS[order.orderStatus as number]
        : undefined,
    orderInvalidReason: order.orderInvalidReason,
    pricePerSellToken: String(Number(buyAmount) / Number(sellAmount)),
    pricePerBuyToken: String(Number(sellAmount) / Number(buyAmount)),
    network:
      publicClient.chain?.name ?? String(await publicClient.getChainId()),
  } satisfies FormattedLimitOrder;
};

const extractExpiryDateTime = (makerTraitsHex: string): string => {
  const hex = makerTraitsHex.startsWith("0x")
    ? makerTraitsHex.slice(2)
    : makerTraitsHex;

  if (hex.length !== 64) {
    throw new Error(
      "Invalid makerTraits length: expected 32 bytes / 64 hex chars",
    );
  }

  const traits = BigInt("0x" + hex);

  // Extract expiration from bits 80-119 (shift right by 80 bits, then mask 40 bits)
  const expirationSeconds = Number((traits >> 80n) & 0xffffffffffn);

  const expiryDate = new Date(expirationSeconds * 1000);

  return expiryDate.toISOString();
};
