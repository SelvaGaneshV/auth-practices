import { serve } from "@hono/node-server";
import { env } from "@auth-practices/env/server";
import { createApi } from "@auth-practices/api";

const app = createApi({
  SUPER_ADMIN_CORS_ORGIN: env.SUPER_ADMIN_CORS_ORGIN,
  ADMIN_CORS_ORGIN: env.ADMIN_CORS_ORGIN,
  USER_CORS_ORGIN: env.USER_CORS_ORGIN,
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
