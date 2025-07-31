import { Entity, PrimaryKey, Property, Enum } from "@mikro-orm/core";
import { BaseEntity } from "./base.entity.js";

export enum UserRole {
  GURU = "guru",
  ADMIN = "admin",
  USER = "user",
}

@Entity()
export class User extends BaseEntity {
  @PrimaryKey({ type: "uuid" })
  id!: string;

  @Property({ type: "text", unique: true })
  firebaseUID!: string;

  @Property({ type: "text", nullable: true })
  name?: string;

  @Property({ type: "text", nullable: true })
  email?: string;

  @Enum({ items: () => UserRole, nativeEnumName: "user_role" })
  role!: UserRole;
}
