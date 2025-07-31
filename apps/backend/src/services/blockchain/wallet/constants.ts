import { WalletTypes } from "./types.js";

export const walletTypes = new Map<WalletTypes, string>([
  ["private_key_wallet", "Private Key Wallet"],
  ["custodial_wallet", "Custodial Wallet"],
]);
