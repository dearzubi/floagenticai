import { OneInchService } from "../../index.js";
import { OneInchCreateLimitOrderArgs } from "../types.js";
import {
  approveERC20TokenAllowance,
  getERC20TokenInfo,
} from "../../../../token/erc20/utils.js";
import { validateOneInchTokenAmount } from "../../utils.js";
import { WalletClientWithAccount } from "../../../../network/evm/client/viem/types.js";
import {
  Address,
  Api,
  getLimitOrderContract,
  randBigInt,
  MakerTraits,
  Sdk,
} from "@1inch/limit-order-sdk";
import { FetchProviderConnector } from "./http.js";
import { formatLimitOrder } from "./utils.js";
import { FormattedLimitOrder } from "./types.js";
import { LimitOrderProtocolAbi } from "./limit-order-protcol.abi.js";
import { Hex } from "viem";
import { getEVMTxExplorerUrl } from "../../../../network/evm/utils/tx.js";
import { logger } from "../../../../../../utils/logger/index.js";

export const DEFAULT_EXPIRY_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours

export class LimitOrders {
  constructor(private service: OneInchService) {}

  async createLimitOrder({
    sellToken,
    buyToken,
    amountSell,
    amountBuy,
    expiryDays,
  }: OneInchCreateLimitOrderArgs): Promise<string> {
    const publicClient = this.service.clients.publicClient;
    const walletClient = this.service.clients
      .walletClient as WalletClientWithAccount;

    const [tokenIn, tokenOut] = await Promise.all([
      getERC20TokenInfo(sellToken, publicClient),
      getERC20TokenInfo(buyToken, publicClient),
    ]);

    const chainId = await publicClient.getChainId();

    const amountsSell = validateOneInchTokenAmount(
      amountSell,
      tokenIn.decimals,
    );
    const amountsBuy = validateOneInchTokenAmount(amountBuy, tokenOut.decimals);

    await approveERC20TokenAllowance({
      tokenAddress: tokenIn.address,
      accountAddress: walletClient.account.address,
      spenderAddress: getLimitOrderContract(chainId),
      amount: amountsSell.amountBigInt * 2n, // Ensure a double allowance to prevent any issues
      publicClient,
      walletClient,
    });

    logger.debug(`Creating 1Inch limit order with parameters`, {
      makerAsset: new Address(tokenIn.address),
      takerAsset: new Address(tokenOut.address),
      makingAmount: amountsSell.amountBigInt,
      takingAmount: amountsBuy.amountBigInt,
      maker: new Address(walletClient.account.address),
      receiver: new Address(walletClient.account.address),
    });

    const sdk = new Sdk({
      authKey: this.service.oneInchAPIKey,
      networkId: chainId,
      httpConnector: new FetchProviderConnector(),
    });

    const UINT_40_MAX = (1n << 40n) - 1n;

    let expiryTime = DEFAULT_EXPIRY_TIME_MS;
    if (expiryDays) {
      expiryTime = expiryDays * 24 * 60 * 60 * 1000;
    }

    const makerTraits = MakerTraits.default()
      .withExpiration(BigInt(Math.floor((Date.now() + expiryTime) / 1000)))
      // .enableNativeUnwrap()
      .allowPartialFills()
      .allowMultipleFills()
      .withNonce(randBigInt(UINT_40_MAX));

    const order = await sdk.createOrder(
      {
        makerAsset: new Address(tokenIn.address),
        takerAsset: new Address(tokenOut.address),
        makingAmount: amountsSell.amountBigInt,
        takingAmount: amountsBuy.amountBigInt,
        maker: new Address(walletClient.account.address),
      },
      makerTraits,
    );

    const typedData = order.getTypedData(chainId);

    const signature = await walletClient.signTypedData({
      account: walletClient.account,
      domain: typedData.domain,
      types: { Order: typedData.types.Order },
      primaryType: "Order",
      message: typedData.message,
    });

    await sdk.submitOrder(order, signature);

    return order.getOrderHash(chainId);
  }

  async getAllLimitOrders(
    currentStatus: "active" | "expired" | "cancelled" = "active",
  ): Promise<FormattedLimitOrder[]> {
    const publicClient = this.service.clients.publicClient;
    const walletClient = this.service.clients
      .walletClient as WalletClientWithAccount;
    const chainId = await publicClient.getChainId();

    const oneInchApi = new Api({
      networkId: chainId,
      authKey: this.service.oneInchAPIKey,
      httpConnector: new FetchProviderConnector(),
    });
    let orders = await oneInchApi.getOrdersByMaker(
      new Address(walletClient.account.address),
      {
        statuses: [1, 2, 3],
      },
    );

    if (currentStatus === "cancelled") {
      orders = orders.filter((order) =>
        order.orderInvalidReason?.includes("cancelled"),
      );
    } else if (currentStatus === "expired") {
      orders = orders.filter((order) =>
        order.orderInvalidReason?.includes("expired"),
      );
    } else if (currentStatus === "active") {
      orders = orders.filter(
        (order) =>
          !order.orderInvalidReason ||
          (!order.orderInvalidReason?.includes("expired") &&
            !order.orderInvalidReason?.includes("cancelled")),
      );
    }

    return await Promise.all(
      orders.map((order) => formatLimitOrder(order, publicClient)),
    );
  }

  async getLimitOrder(orderHash: string): Promise<FormattedLimitOrder> {
    const publicClient = this.service.clients.publicClient;
    const chainId = await publicClient.getChainId();
    const oneInchApi = new Api({
      networkId: chainId,
      authKey: this.service.oneInchAPIKey,
      httpConnector: new FetchProviderConnector(),
    });
    const order = await oneInchApi.getOrderByHash(orderHash);

    return await formatLimitOrder(order, publicClient);
  }

  async cancelLimitOrder(orderHash: string): Promise<string> {
    const publicClient = this.service.clients.publicClient;
    const walletClient = this.service.clients
      .walletClient as WalletClientWithAccount;
    const chainId = await publicClient.getChainId();
    const oneInchApi = new Api({
      networkId: chainId,
      authKey: this.service.oneInchAPIKey,
      httpConnector: new FetchProviderConnector(),
    });

    const order = await oneInchApi.getOrderByHash(orderHash);

    const { request } = await publicClient.simulateContract({
      account: walletClient.account,
      address: getLimitOrderContract(chainId) as Hex,
      abi: LimitOrderProtocolAbi,
      functionName: "cancelOrder",
      args: [BigInt(order.data.makerTraits), orderHash as Hex],
    });
    const hash = await walletClient.writeContract(request);

    const txLink = getEVMTxExplorerUrl(hash, publicClient);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "reverted") {
      throw new Error(
        `Cancel limit order transaction reverted for unknown reason. Please try again. Tx: ${txLink}`,
      );
    }

    return txLink;
  }
}
