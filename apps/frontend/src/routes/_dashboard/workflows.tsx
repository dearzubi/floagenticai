import { createFileRoute } from "@tanstack/react-router";
import Workflows from "../../components/pages/workflow";

export const Route = createFileRoute("/_dashboard/workflows")({
  component: Workflows,
});
