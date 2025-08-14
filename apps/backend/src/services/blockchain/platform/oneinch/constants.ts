import { SupportedNetworks } from "./types.js";

export const supportedNetworks = new Map<SupportedNetworks, string>([
  ["mainnet", "Ethereum Mainnet"],
  ["base", "Base"],
  ["arbitrum", "Arbitrum One"],
  ["optimism", "Optimism"],
  ["polygon", "Polygon"],
  ["avalanche", "Avalanche C-Chain"],
  ["linea", "Linea Mainnet"],
  ["bsc", "BNB Smart Chain"],
  ["gnosis", "Gnosis Chain"],
]);

export const networksList = Array.from(supportedNetworks.keys());
