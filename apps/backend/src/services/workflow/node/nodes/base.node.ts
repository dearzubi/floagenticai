import { IBaseNode, INodeVersion } from "../types.js";
import { NodeBaseDescription, NodeSerialised } from "common";

/**
 * Represents the base structure for a workflow Node, implementing the IBaseNode interface.
 * Handles the management of node versions, their descriptions, and serialization.
 */
export class BaseNode implements IBaseNode {
  currentVersion: number;

  nodeVersions: IBaseNode["nodeVersions"];

  serialised: NodeSerialised;

  description: NodeBaseDescription;

  constructor(
    nodeVersions: IBaseNode["nodeVersions"],
    description: NodeBaseDescription,
  ) {
    // Sorts the object in ascending order of version numbers
    this.nodeVersions = Object.keys(nodeVersions)
      .sort((a, b) => Number(a) - Number(b))
      .reduce(
        (sorted, version) => {
          const versionNumber = Number(version);
          const nodeVersion = nodeVersions[versionNumber];

          if (nodeVersion) {
            sorted[versionNumber] = nodeVersion;
          }

          return sorted;
        },
        {} as IBaseNode["nodeVersions"],
      );

    this.currentVersion = description.defaultVersion ?? this.getLatestVersion();
    this.description = description;

    this.serialised = {
      ...description,
      currentVersion: this.currentVersion,
      versions: Object.values(this.nodeVersions).map((nodeVersion) => {
        return {
          ...nodeVersion.description,
        };
      }),
    };
  }

  /**
   * Get the latest version number (the highest version number available)
   */
  getLatestVersion(): number {
    return Math.max(...Object.keys(this.nodeVersions).map(Number));
  }

  /**
   * Retrieve a specific version of the node.
   * If no version number is specified, then it returns the current version
   * @param {number} version - Node version number
   */
  getNodeVersion(version?: number): INodeVersion | undefined {
    return this.nodeVersions[version ?? this.currentVersion];
  }

  /**
   * Serialise the node to a JSON object, removing any functions and only retaining properties
   */
  toJSON(): Record<string, unknown> {
    return this.serialised;
  }
}
