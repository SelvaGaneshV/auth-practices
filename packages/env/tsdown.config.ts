import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/server.ts", "./src/web.ts"],
  format: "esm",
  outDir: "./dist",
  clean: true,
  dts: true,
});
