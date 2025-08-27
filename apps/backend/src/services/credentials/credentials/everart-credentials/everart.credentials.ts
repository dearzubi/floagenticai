import { INodeCredential } from "common";

export class EverArtCredentials implements INodeCredential {
  name: INodeCredential["name"];
  label: INodeCredential["label"];
  icon: INodeCredential["icon"];
  properties: INodeCredential["properties"];

  constructor() {
    this.name = "everart_credentials";
    this.label = "EvertArt Credentials";
    this.icon = "everart-logo.png";
    this.properties = [
      {
        name: "api_key",
        label: "API Key",
        type: "password",
      },
    ];
  }
}
