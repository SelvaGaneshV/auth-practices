import { createFileRoute, redirect } from "@tanstack/react-router";
import { CheckFeature } from "~/components/check-feature-flag";

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
  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="h-full max-w-3xl px-4 gap-2.5 flex flex-col items-center justify-center">
        <CheckFeature />
      </div>
    </div>
  );
}
