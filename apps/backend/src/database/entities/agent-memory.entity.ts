import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseEntity } from "./base.entity.js";

@Entity()
export class AgentMemory extends BaseEntity {
  @PrimaryKey({ type: "uuid" })
  workflowId!: string;

  @PrimaryKey({ type: "text" })
  nodeId!: string;

  @PrimaryKey({ type: "text" })
  sessionId!: string;

  @Property({ type: "text" })
  state!: string;

  @Property({ type: "text" })
  history!: string;
}
