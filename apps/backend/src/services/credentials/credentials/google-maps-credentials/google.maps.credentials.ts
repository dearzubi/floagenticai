import { INodeCredential } from "common";

export class GoogleMapsCredentials implements INodeCredential {
  name: INodeCredential["name"];
  label: INodeCredential["label"];
  icon: INodeCredential["icon"];
  properties: INodeCredential["properties"];

  constructor() {
    this.name = "google_maps_credentials";
    this.label = "Google Maps Credentials";
    this.icon = "google-maps-logo.svg";
    this.properties = [
      {
        name: "api_key",
        label: "API Key",
        type: "password",
      },
    ];
  }
}
