import { INodeCredential } from "common";

export class OneInchCredentials implements INodeCredential {
  name: INodeCredential["name"];
  label: INodeCredential["label"];
  icon: INodeCredential["icon"];
  properties: INodeCredential["properties"];

  constructor() {
    this.name = "oneinch_credentials";
    this.label = "1Inch Credentials";
    this.icon = "one-inch-logo.png";
    this.properties = [
      {
        name: "api_key",
        label: "API Key",
        type: "password",
      },
    ];
  }
}
