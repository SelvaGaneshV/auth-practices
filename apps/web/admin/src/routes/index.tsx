import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  beforeLoad: async ({ context: { auth } }) => {
    const { ensureAuth, isAuthPending, auth: authState } = auth!;
    if (isAuthPending) {
      const r = await ensureAuth();
      if (!r)
        throw redirect({
          to: "/sign-in",
        });
    } else {
      if (!authState)
        throw redirect({
          to: "/sign-in",
        });
    }
  },
});

function HomeComponent() {
  return <div></div>;
}
