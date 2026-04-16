import { defineConfig } from "tsdown";

export default defineConfig({
  entry: { app: "./src/index.ts" },
  format: "esm",
  outDir: "./",
  clean: false,
  external: ["hono"],
  noExternal: [/@auth-practices\/.*/],
});
