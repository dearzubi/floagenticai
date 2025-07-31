import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import SignUpPage from "./index.tsx";
import { HeroUIProvider } from "@heroui/react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  createMemoryHistory,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import userEvent from "@testing-library/user-event";

// Mock firebase/auth
vi.mock("firebase/auth", async () => {
  const actual = await vi.importActual("firebase/auth");
  return {
    ...actual,
    createUserWithEmailAndPassword: vi.fn(),
    updateProfile: vi.fn(),
    sendEmailVerification: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    GithubAuthProvider: vi.fn(),
  };
});

// Mock useSocialSignIn hook
vi.mock("../../../hooks/auth/useSocialSignIn.ts", () => ({
  default: () => ({
    isSocialSigningIn: false,
    socialSignInError: null,
    socialSignIn: vi.fn(),
    socialSignInProviderId: null,
  }),
}));

// Mock @iconify/react
vi.mock("@iconify/react", () => ({
  Icon: (props: { icon: string }) => (
    <span data-testid={`icon-${props.icon}`} />
  ),
}));

describe("SignUpPage", () => {
  beforeEach(async () => {
    // Mock firebase functions to return promises
    const {
      createUserWithEmailAndPassword,
      updateProfile,
      sendEmailVerification,
    } = await import("firebase/auth");

    (createUserWithEmailAndPassword as Mock).mockResolvedValue({
      user: { uid: "test-uid" },
    });
    (updateProfile as Mock).mockResolvedValue(undefined);
    (sendEmailVerification as Mock).mockResolvedValue(undefined);
  });

  const renderComponent = () => {
    const user = userEvent.setup();

    const rootRoute = createRootRoute({
      component: Outlet,
    });

    const route = createRoute({
      getParentRoute: () => rootRoute,
      path: "/signup",
      component: SignUpPage,
    });

    const routeTree = rootRoute.addChildren([route]);

    const memoryHistory = createMemoryHistory({
      initialEntries: ["/signup"], // Ensure the initial entry matches your route path
    });

    const router = createRouter({ routeTree, history: memoryHistory });

    render(
      <StrictMode>
        <HeroUIProvider>
          <RouterProvider router={router} />
        </HeroUIProvider>
      </StrictMode>,
    );

    return {
      user,
    };
  };

  it("renders the signup form correctly", async () => {
    renderComponent();

    expect(
      await screen.findByRole("heading", { name: /create account/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("textbox", { name: /full name/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("textbox", { name: /email/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("textbox", { name: /^password password$/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("textbox", {
        name: /^confirm password confirm password$/i,
      }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("button", { name: /sign up/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /google/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /github/i }),
    ).toBeInTheDocument();
  });

  // it("shows required error messages if fields are empty on signup attempt", async () => {
  //   const { user } = renderComponent();
  //   await user.click(await screen.findByRole("button", { name: /sign up/i }));
  //
  //   const el = await screen.findByText(/required/i);
  //
  //   console.log(el);
  //
  //   expect(el).toBeInTheDocument();
  //   // expect(
  //   //   await screen.findByText(/last name is required/i),
  //   // ).toBeInTheDocument();
  // });
  //
  //   it("shows password mismatch error", async () => {
  //     renderComponent();
  //     fireEvent.change(screen.getByLabelText(/first name/i), {
  //       target: { value: "Test" },
  //     });
  //     fireEvent.change(screen.getByLabelText(/last name/i), {
  //       target: { value: "User" },
  //     });
  //     fireEvent.change(screen.getByLabelText(/email/i), {
  //       target: { value: "test@example.com" },
  //     });
  //     fireEvent.change(screen.getByLabelText(/^password$/i), {
  //       target: { value: "Password123" },
  //     });
  //     fireEvent.change(screen.getByLabelText(/confirm password/i), {
  //       target: { value: "Password1234" },
  //     });
  //
  //     fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
  //
  //     expect(
  //       await screen.findByText(/passwords do not match/i),
  //     ).toBeInTheDocument();
  //   });
  //
  //   it("successfully signs up a user with valid information", async () => {
  //     const {
  //       createUserWithEmailAndPassword,
  //       updateProfile,
  //       sendEmailVerification,
  //     } = await import("firebase/auth");
  //
  //     renderComponent();
  //
  //     fireEvent.change(screen.getByLabelText(/first name/i), {
  //       target: { value: "Test" },
  //     });
  //     fireEvent.change(screen.getByLabelText(/last name/i), {
  //       target: { value: "User" },
  //     });
  //     fireEvent.change(screen.getByLabelText(/email/i), {
  //       target: { value: "test@example.com" },
  //     });
  //     fireEvent.change(screen.getByLabelText(/^password$/i), {
  //       target: { value: "Password123!" },
  //     });
  //     fireEvent.change(screen.getByLabelText(/confirm password/i), {
  //       target: { value: "Password123!" },
  //     });
  //
  //     fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
  //
  //     await waitFor(() => {
  //       expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
  //       expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
  //         expect.anything(),
  //         "test@example.com",
  //         "Password123!",
  //       );
  //     });
  //
  //     await waitFor(() => {
  //       expect(updateProfile).toHaveBeenCalledTimes(1);
  //       expect(updateProfile).toHaveBeenCalledWith(expect.anything(), {
  //         displayName: "Test User",
  //       });
  //     });
  //
  //     await waitFor(() => {
  //       expect(sendEmailVerification).toHaveBeenCalledTimes(1);
  //     });
  //
  //     expect(
  //       await screen.findByText(
  //         /your account has been created. please check your email to verify your account./i,
  //       ),
  //     ).toBeInTheDocument();
  //
  //     expect(screen.getByLabelText(/first name/i)).toHaveValue("");
  //     expect(screen.getByLabelText(/last name/i)).toHaveValue("");
  //     expect(screen.getByLabelText(/email/i)).toHaveValue("");
  //     expect(screen.getByLabelText(/^password$/i)).toHaveValue("");
  //     expect(screen.getByLabelText(/confirm password/i)).toHaveValue("");
  //   });
  //
  //   it("calls socialSignIn with GoogleAuthProvider when Google button is clicked", async () => {
  //     const { socialSignIn } = (
  //       await import("../../../hooks/auth/useSocialSignIn.ts")
  //     ).default();
  //     const { GoogleAuthProvider } = await import("firebase/auth");
  //
  //     renderComponent();
  //     fireEvent.click(screen.getByRole("button", { name: /google/i }));
  //
  //     await waitFor(() => {
  //       expect(socialSignIn).toHaveBeenCalledTimes(1);
  //       expect(socialSignIn).toHaveBeenCalledWith(expect.any(GoogleAuthProvider));
  //     });
  //   });
  //
  //   it("calls socialSignIn with GithubAuthProvider when GitHub button is clicked", async () => {
  //     const { socialSignIn } = (
  //       await import("../../../hooks/auth/useSocialSignIn.ts")
  //     ).default();
  //     const { GithubAuthProvider } = await import("firebase/auth");
  //
  //     renderComponent();
  //     fireEvent.click(screen.getByRole("button", { name: /github/i }));
  //
  //     await waitFor(() => {
  //       expect(socialSignIn).toHaveBeenCalledTimes(1);
  //       expect(socialSignIn).toHaveBeenCalledWith(expect.any(GithubAuthProvider));
  //     });
  //   });
  //
  //   it("toggles password visibility", () => {
  //     renderComponent();
  //     const passwordInput = screen.getByLabelText(/^password$/i);
  //     const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
  //     const visibilityToggleButtons = screen.getAllByRole("button", {
  //       name: /eye|eye-off/i,
  //     });
  //
  //     expect(passwordInput).toHaveAttribute("type", "password");
  //     expect(confirmPasswordInput).toHaveAttribute("type", "password");
  //
  //     fireEvent.click(visibilityToggleButtons[0]);
  //     expect(passwordInput).toHaveAttribute("type", "text");
  //     expect(confirmPasswordInput).toHaveAttribute("type", "text");
  //
  //     fireEvent.click(visibilityToggleButtons[1]);
  //     expect(passwordInput).toHaveAttribute("type", "password");
  //     expect(confirmPasswordInput).toHaveAttribute("type", "password");
  //   });
});
