import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";
import { Organisations } from "~/components/organisations";
import { OrgansationsTable } from "~/components/organisations/organisations-table";
const serachSchema = z.object({
  page: z.number().min(1).default(1),
  pagesize: z.number().min(5).default(5),
});

export const Route = createFileRoute("/")({
  component: HomeComponent,
  validateSearch: serachSchema,
  beforeLoad: async ({ context: { auth } }) => {
    const { ensureAuth, isAuthPending, auth: authState } = auth!;
    if (isAuthPending) {
      const r = await ensureAuth();
      if (!r)
        throw redirect({
          to: "/sigin-in",
        });
    } else {
      if (!authState)
        throw redirect({
          to: "/sigin-in",
        });
    }
  },
});

function HomeComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="h-full max-w-3xl px-4 gap-2.5 flex flex-col items-center justify-center">
        <Organisations />
        <OrgansationsTable />
      </div>
    </div>
  );
}
