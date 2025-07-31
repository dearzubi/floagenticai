import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseEntity } from "./base.entity.js";
import { User } from "./user.entity.js";
import { ApiKey } from "./apikey.entity.js";

@Entity()
export class Workflow extends BaseEntity {
  @PrimaryKey({ type: "uuid" })
  id!: string;

  @Property({ type: "text" })
  name!: string;

  @Property({ type: "text" })
  flowData!: string;

  @Property({ type: "int", default: 1 })
  currentVersion!: number;

  @Property({ nullable: true, type: "boolean" })
  isActive?: boolean;

  @ManyToOne({ nullable: true })
  apiKey?: ApiKey;

  @Property({ nullable: true, type: "text" })
  config?: string;

  @Property({ nullable: true, type: "text" })
  category?: string;

  @ManyToOne()
  user!: User;
}
