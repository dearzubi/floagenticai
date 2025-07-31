import { createFileRoute } from "@tanstack/react-router";
import Credentials from "../../components/pages/credential";

export const Route = createFileRoute("/_dashboard/credentials")({
  component: Credentials,
});
