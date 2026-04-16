import { serve } from "@hono/node-server";
import { createApi } from "@auth-practices/api";

const app = createApi();

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

export default app;
