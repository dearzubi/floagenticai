import { WalletTypes } from "../../../blockchain/wallet/types.js";
import { NodeProperty } from "common";

export const evmWeb3WalletProperties = {
  label: "Wallet Configurations",
  name: "wallet_configurations",
  type: "section",
  collection: [
    {
      name: "wallet_type",
      label: "Wallet Type",
      type: "options",
      options: [
        {
          name: "private_key_wallet",
          label: "Private Key Wallet",
        },
        {
          name: "custodial_wallet",
          label: "Custodial Wallet",
        },
      ],
      default: "private_key_wallet" as WalletTypes,
    },
    {
      name: "evm_pk_credentials",
      label: "EVM Private Key Credentials",
      type: "credential",
      displayOptions: {
        show: {
          "wallet_configurations.wallet_type": ["private_key_wallet"],
        },
      },
    },
    {
      type: "credential",
      label: "RPC Credentials",
      name: "rpc_credentials",
      optional: true,
    },
  ],
} satisfies NodeProperty;
