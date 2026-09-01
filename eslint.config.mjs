import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // `any` is used intentionally for JS/Mongoose interop and dynamic payloads.
      // Downgraded to a warning so it doesn't block builds while remaining visible.
      "@typescript-eslint/no-explicit-any": "warn",
      // Standard async data-fetch-on-mount in client components.
      "react-hooks/set-state-in-effect": "warn",
      // Catch/handler error variables that are intentionally ignored.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]);

export default eslintConfig;
