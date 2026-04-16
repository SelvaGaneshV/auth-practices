import { createApi } from "@auth-practices/api";
import { Hono } from "hono";
const api = createApi();

const app = new Hono().route("/*", api);

export default app;
