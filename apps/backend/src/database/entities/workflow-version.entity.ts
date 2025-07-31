import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseEntity } from "./base.entity.js";
import { User } from "./user.entity.js";
import { Workflow } from "./workflow.entity.js";

@Entity()
export class WorkflowVersion extends BaseEntity {
  @PrimaryKey({ type: "uuid" })
  id!: string;

  @Property({ type: "int" })
  version!: number;

  @Property({ type: "text" })
  name!: string;

  @Property({ type: "text" })
  flowData!: string;

  @Property({ nullable: true, type: "text" })
  config?: string;

  @Property({ nullable: true, type: "text" })
  category?: string;

  @Property({ type: "text", nullable: true })
  description?: string;

  @ManyToOne()
  workflow!: Workflow;

  @ManyToOne()
  user!: User;
}
