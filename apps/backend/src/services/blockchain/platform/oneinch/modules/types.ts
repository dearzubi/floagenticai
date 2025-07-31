export type OneInchQuotationArgs = {
  sellToken: string;
  buyToken: string;
  amount: string;
};

export type OneInchSwapTokensArgs = OneInchQuotationArgs & {
  slippagePercentage: number;
};

export type OneInchCreateLimitOrderArgs = Omit<
  OneInchQuotationArgs,
  "amount"
> & {
  amountSell: string;
  amountBuy: string;
  expiryDays?: number;
};
