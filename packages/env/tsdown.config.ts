import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/server.ts"],
  format: "esm",
  outDir: "./dist",
  dts: true,
  clean: true,
});
