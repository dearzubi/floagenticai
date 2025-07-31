import { Property, OptionalProps } from "@mikro-orm/core";

export abstract class BaseEntity {
  [OptionalProps]?: "createdAt" | "updatedAt";

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
