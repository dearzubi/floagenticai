// < ---- Following two lines: Required to use MikroORM CLI ---->
import "dotenv/config";
import "./utils/env-schema";
// < ---- Above two lines: Required to use MikroORM CLI ---->

import { defineConfig } from "@mikro-orm/postgresql";
import { Migrator } from "@mikro-orm/migrations";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

export default defineConfig({
  entities: ["./dist/**/*.entity.js"],
  entitiesTs: ["./src/**/*.entity.ts"],
  migrations: {
    path: "./dist/database/migrations",
    pathTs: "./src/database/migrations",
  },
  dbName: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  disableIdentityMap: true, // TODO: In future, understand Identity Map in depth and maybe use them, but for now always fetch fresh entity from DB
  extensions: [Migrator],
  metadataProvider: TsMorphMetadataProvider,
  debug: process.env.DATABASE_ENABLE_LOGGING,
});
