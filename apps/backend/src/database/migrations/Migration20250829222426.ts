import { Migration } from '@mikro-orm/migrations';

export class Migration20250829222426 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create type "user_role" as enum ('guru', 'admin', 'user');`);
    this.addSql(`create type "chat_sender_role" as enum ('user', 'assistant');`);
    this.addSql(`create type "chat_status" as enum ('thinking', 'generating', 'completed', 'error');`);
    this.addSql(`create table "agent_memory" ("workflow_id" uuid not null, "node_id" text not null, "session_id" text not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "state" text not null, "history" text not null, constraint "agent_memory_pkey" primary key ("workflow_id", "node_id", "session_id"));`);

    this.addSql(`create table "user" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "firebase_uid" text not null, "name" text null, "email" text null, "role" "user_role" not null, constraint "user_pkey" primary key ("id"));`);
    this.addSql(`alter table "user" add constraint "user_firebase_uid_unique" unique ("firebase_uid");`);

    this.addSql(`create table "credential" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" text not null, "credential_name" text not null, "encrypted_data" text not null, "user_id" uuid not null, constraint "credential_pkey" primary key ("id"));`);

    this.addSql(`create table "mcpinstallation" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" uuid not null, "mcp_server_name" varchar(255) not null, "name" varchar(255) not null, "selected_tools" jsonb not null, "approval_required_tools" jsonb not null, "credential_id" uuid null, "configuration" jsonb null, "status" text check ("status" in ('enabled', 'disabled')) not null default 'enabled', "description" text null, constraint "mcpinstallation_pkey" primary key ("id"));`);

    this.addSql(`create table "chat" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "workflow_id" uuid not null, "execution_id" text null, "session_id" text not null, "node_data" text not null, "role" "chat_sender_role" not null, "status" "chat_status" not null, "content" text not null, "artifacts" text null, "user_id" uuid not null, constraint "chat_pkey" primary key ("id"));`);

    this.addSql(`create table "api_key" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "api_key" text not null, "api_secret" text not null, "key_name" text not null, "user_id" uuid not null, constraint "api_key_pkey" primary key ("id"));`);

    this.addSql(`create table "workflow" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" text not null, "flow_data" text not null, "current_version" int not null default 1, "is_active" boolean null, "api_key_id" uuid null, "config" text null, "category" text null, "user_id" uuid not null, constraint "workflow_pkey" primary key ("id"));`);

    this.addSql(`create table "workflow_version" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "version" int not null, "name" text not null, "flow_data" text not null, "config" text null, "category" text null, "description" text null, "workflow_id" uuid not null, "user_id" uuid not null, constraint "workflow_version_pkey" primary key ("id"));`);

    this.addSql(`alter table "credential" add constraint "credential_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "mcpinstallation" add constraint "mcpinstallation_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "mcpinstallation" add constraint "mcpinstallation_credential_id_foreign" foreign key ("credential_id") references "credential" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "chat" add constraint "chat_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "api_key" add constraint "api_key_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "workflow" add constraint "workflow_api_key_id_foreign" foreign key ("api_key_id") references "api_key" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "workflow" add constraint "workflow_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "workflow_version" add constraint "workflow_version_workflow_id_foreign" foreign key ("workflow_id") references "workflow" ("id") on update cascade;`);
    this.addSql(`alter table "workflow_version" add constraint "workflow_version_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
  }

}
