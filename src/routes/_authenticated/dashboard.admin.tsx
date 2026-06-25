import { createFileRoute } from "@tanstack/react-router";
import { RoleDashboard } from "@/components/auth/RoleDashboard";

export const Route = createFileRoute("/_authenticated/dashboard/admin")({
  component: () => (
    <RoleDashboard
      role="officer"
      title="Admin Dashboard"
      subtitle="System administration and oversight."
      primaryCta={{ label: "Manage Users", to: "/profile" }}
    />
  ),
});
