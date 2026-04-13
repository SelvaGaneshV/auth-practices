import { Toaster } from "@auth-practices/ui/components/sonner";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { ThemeProvider } from "~/components/theme-provider";
import "../index.css";
import type { QueryClient } from "@tanstack/react-query";
import type { AuthState } from "~/context/auth";

export interface RouterAppContext {
  queryClient: QueryClient;
  auth?: AuthState;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "auth-practices",
      },
      {
        name: "description",
        content: "auth-practices is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <Outlet />

        <Toaster richColors />
      </ThemeProvider>
    </>
  );
}
