import { createFileRoute, Outlet } from "@tanstack/react-router";
import MainLayout from "../../components/layouts/MainLayout.tsx";
export const Route = createFileRoute("/_landing")({
  component: () => {
    return (
      <MainLayout>
        <Outlet />
      </MainLayout>
    );
  },
});
