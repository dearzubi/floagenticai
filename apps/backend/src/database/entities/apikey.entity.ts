import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseEntity } from "./base.entity.js";
import { User } from "./user.entity.js";

@Entity()
export class ApiKey extends BaseEntity {
  @PrimaryKey({ type: "uuid" })
  id!: string;

  @Property({ type: "text" })
  apiKey!: string;

  @Property({ type: "text" })
  apiSecret!: string;

  @Property({ type: "text" })
  keyName!: string;

  @ManyToOne()
  user!: User;
}
