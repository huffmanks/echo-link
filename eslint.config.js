//  @ts-check
import { tanstackConfig } from "@tanstack/eslint-config";
import tseslint from "typescript-eslint";

export default [
  ...tanstackConfig,
  {
    ...tseslint.configs.disableTypeChecked,
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
  },
  {
    rules: {
      "import/order": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },
];
