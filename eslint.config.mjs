import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    // Domain and application layers must stay framework-agnostic.
    files: ["src/domain/**/*.ts", "src/application/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react-*", "next", "next/*"],
              message: "Domain code must not depend on UI frameworks.",
            },
            {
              group: ["@/components/*", "@/app/*", "@/state/*"],
              message: "Domain code must not depend on presentation.",
            },
          ],
        },
      ],
    },
  },
  {
    // Scripts de desenvolvimento escrevem no terminal.
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    ".claude/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
