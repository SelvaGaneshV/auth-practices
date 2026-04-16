import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  format: "esm",
  outDir: "./api",
  outExtensions: () => ({ js: ".js" }),
  clean: true,
  deps: {
    alwaysBundle: [/@auth-practices\/.*/],
  },
});
