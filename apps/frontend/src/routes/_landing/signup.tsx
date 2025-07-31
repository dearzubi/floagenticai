import { createFileRoute } from "@tanstack/react-router";
import SignUpPage from "../../components/pages/signup";

export const Route = createFileRoute("/_landing/signup")({
  component: SignUpPage,
});
