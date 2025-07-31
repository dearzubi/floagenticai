import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import NotFoundPage from "../components/pages/not-found";

interface TanStackRouterContext {}

export const Route = createRootRouteWithContext<TanStackRouterContext>()({
  component: () => {
    return (
      <>
        <Outlet />
        {/*{import.meta.env.DEV && <TanStackRouterDevtools />}*/}
      </>
    );
  },
  notFoundComponent: NotFoundPage,
});
