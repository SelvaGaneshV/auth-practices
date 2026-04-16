import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
    "schema/index": "./src/schema/index.ts",
  },
  format: "esm",
  outDir: "./dist",
  dts: true,
  clean: true,
});
