import { createApi } from "@auth-practices/api";
import { handle } from "hono/vercel";
const app = createApi();

export default handle(app);
