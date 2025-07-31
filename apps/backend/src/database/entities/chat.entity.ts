import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseEntity } from "./base.entity.js";
import { User } from "./user.entity.js";

export enum ChatSenderRole {
  USER = "user", // human user
  ASSISTANT = "assistant", // AI model/bot/node
}

export enum ChatStatus {
  thinking = "thinking",
  GENERATING = "generating",
  COMPLETED = "completed",
  ERROR = "error",
}

@Entity()
export class Chat extends BaseEntity {
  @PrimaryKey({ type: "uuid" })
  id!: string;

  @Property({ type: "uuid" })
  workflowId!: string;

  @Property({ type: "text", nullable: true })
  executionId?: string;

  @Property({ type: "text" })
  sessionId!: string;

  @Property({ type: "text" })
  nodeData!: string;

  @Enum({ items: () => ChatSenderRole, nativeEnumName: "chat_sender_role" })
  role!: ChatSenderRole;

  @Enum({ items: () => ChatStatus, nativeEnumName: "chat_status" })
  status!: ChatStatus;

  @Property({ type: "text" })
  content!: string;

  @Property({ type: "text", nullable: true })
  artifacts?: string;

  @ManyToOne()
  user!: User;
}
