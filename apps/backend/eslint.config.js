// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

import { commonRules } from "../../eslint.common.js";
import noConsoleLogger from "./eslint/rules/no-console-logger.js";
export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strict,
      tseslint.configs.stylistic,
      eslintConfigPrettier,
    ],
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: 2024,
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "custom-rules": {
        rules: {
          "no-console-logger": noConsoleLogger,
        },
      },
    },
    rules: {
      ...tseslint.plugin.configs.recommended.rules,
      ...tseslint.plugin.configs.strict.rules,
      ...eslintConfigPrettier.rules,
      ...commonRules,
      "@typescript-eslint/no-explicit-any": "warn",
      "custom-rules/no-console-logger":
        process.env.CI || process.env.NODE_ENV === "production"
          ? "error"
          : "warn",
      "@typescript-eslint/prefer-interface": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
    },
  },
);
