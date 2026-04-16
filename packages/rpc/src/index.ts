import type { ApiType } from "@auth-practices/api";
import { env } from "@auth-practices/env/web";
import { hc, parseResponse, type DetailedError } from "hono/client";

const rpc = hc<ApiType>(env.VITE_SERVER_URL, {
  init: {
    credentials: "include",
  },
});

export { parseResponse, rpc, type DetailedError };
