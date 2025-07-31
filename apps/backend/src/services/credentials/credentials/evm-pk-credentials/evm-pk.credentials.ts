import { INodeCredential } from "common";

export class EVMPrivateKeyCredentials implements INodeCredential {
  name: INodeCredential["name"];
  label: INodeCredential["label"];
  icon: INodeCredential["icon"];
  properties: INodeCredential["properties"];

  constructor() {
    this.name = "evm_pk_credentials";
    this.label = "EVM Private Key Credentials";
    this.icon = "ethereum-logo.svg";
    this.properties = [
      {
        name: "private_key",
        label: "Private Key",
        type: "password",
      },
    ];
  }
}
