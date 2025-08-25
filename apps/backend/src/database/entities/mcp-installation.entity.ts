import { Entity, PrimaryKey, Property, ManyToOne, Enum } from "@mikro-orm/core";
import { v4 } from "uuid";
import { BaseEntity } from "./base.entity.js";
import { User } from "./user.entity.js";
import { Credential } from "./credential.entity.js";

export enum MCPInstallationStatus {
  ENABLED = "enabled",
  DISABLED = "disabled",
}

@Entity()
export class MCPInstallation extends BaseEntity {
  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  mcpServerName!: string;

  @Property()
  name!: string;

  @Property({ type: "json" })
  selectedTools!: string[];

  @Property({ type: "json" })
  approvalRequiredTools!: string[];

  @ManyToOne(() => Credential, { nullable: true })
  credential?: Credential;

  @Property({ type: "json", nullable: true })
  configuration?: Record<string, unknown>;

  @Enum(() => MCPInstallationStatus)
  status: MCPInstallationStatus = MCPInstallationStatus.ENABLED;

  @Property({ type: "text", nullable: true })
  description?: string;
}
