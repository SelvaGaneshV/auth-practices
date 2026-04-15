import { hc, parseResponse, type DetailedError } from "hono/client";
import type { Api } from "@auth-practices/server";
import { env } from "@auth-practices/env/web";

const rpc = hc<Api>(env.VITE_SERVER_URL, {
  init: {
    credentials: "include",
  },
});

export { parseResponse, rpc, type DetailedError };
