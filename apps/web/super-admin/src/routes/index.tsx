import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
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
  return <div className="flex items-center justify-center min-h-screen w-full px-4"></div>;
}
