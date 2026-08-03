import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import globals from "globals";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "node_modules/**",
    "next-env.d.ts",
    "public/build-stamp.json",
  ]),
  {
    files: ["scripts/**/*.mjs", "test/**/*.mjs"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
]);
