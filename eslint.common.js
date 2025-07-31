export const commonRules = {
  "no-unused-vars": "off",
  "no-console": [
    process.env.CI ? "error" : "warn",
    { allow: ["warn", "error"] },
  ],
  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      vars: "all",
      args: "all",
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    },
  ],
  "@typescript-eslint/explicit-module-boundary-types": "error",
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-misused-promises": [
    "error",
    {
      checksVoidReturn: false,
    },
  ],
  "@typescript-eslint/no-namespace": "off",
  "@typescript-eslint/no-empty-object-type": "off",
  "@typescript-eslint/prefer-interface": "off",
  curly: "error",
};
