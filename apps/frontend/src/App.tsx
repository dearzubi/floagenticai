import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router.tsx";
import { HeroUIProvider } from "@heroui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/query-client.ts";
import { ToastContainer } from "react-toastify";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function RouterProviderComponent() {
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <HeroUIProvider>
        <RouterProviderComponent />
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
