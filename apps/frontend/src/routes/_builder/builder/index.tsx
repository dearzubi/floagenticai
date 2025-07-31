import { createFileRoute } from "@tanstack/react-router";
import Builder from "../../../components/pages/workflow/builder";

export const Route = createFileRoute("/_builder/builder/")({
  component: Builder,
});
