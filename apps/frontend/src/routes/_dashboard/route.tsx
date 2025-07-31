import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import DashboardLayout from "../../components/layouts/DashboardLayout.tsx";
import AnimatedLoader from "../../components/ui/loader/AnimatedLoader.tsx";
import { getCurrentUser } from "../../lib/firebase";
import { useUserStore } from "../../stores/user.store.ts";
import { useSocketStore } from "../../stores/socket.store.ts";

export const Route = createFileRoute("/_dashboard")({
  pendingComponent: AnimatedLoader,
  beforeLoad: async ({ location }) => {
    const fbUser = await getCurrentUser();

    if (!fbUser) {
      useUserStore.getState().setUser(null);
      throw redirect({
        to: "/signin",
        search: {
          redirect: location.href,
        },
      });
    }

    useUserStore.getState().setUser(fbUser);
    try {
      await useSocketStore.getState().connect();
    } catch (error) {
      console.error("Failed to connect socket in route:", error);
    }
  },

  component: () => {
    return (
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    );
  },
});
