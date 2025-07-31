import { createFileRoute } from "@tanstack/react-router";
import UserProfilePage from "../../components/pages/profile";

export const Route = createFileRoute("/_dashboard/profile")({
  component: UserProfilePage,
});
