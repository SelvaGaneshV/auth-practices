import { RouterProvider, createRouter, redirect } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { routeTree } from "./routeTree.gen";
import { AuthProvider, useAuth } from "./context/auth";
import { Spinner } from "@auth-practices/ui/components/spinner";

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (e) => {
      if (e.message.includes("401")) {
        redirect({ to: "/sign-in" });
      }
    },
  }),
});

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: () => <Spinner />,
  context: { queryClient, auth: undefined },
});

function Main() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Main />
      </AuthProvider>
    </QueryClientProvider>,
  );
}
