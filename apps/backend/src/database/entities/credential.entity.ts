import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseEntity } from "./base.entity.js";
import { User } from "./user.entity.js";

@Entity()
export class Credential extends BaseEntity {
  @PrimaryKey({ type: "uuid" })
  id!: string;

  @Property({ type: "text" })
  name!: string;

  @Property({ type: "text" })
  credentialName!: string;

  @Property({ type: "text" })
  encryptedData!: string;

  @ManyToOne()
  user!: User;
}
