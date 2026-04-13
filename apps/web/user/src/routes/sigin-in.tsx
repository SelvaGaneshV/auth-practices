import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sigin-in")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="">Hello "/login"!</div>;
}
