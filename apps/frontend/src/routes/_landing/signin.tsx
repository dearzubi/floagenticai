import { createFileRoute } from "@tanstack/react-router";
import SignInPage from "../../components/pages/signin";
import z from "zod";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/_landing/signin")({
  component: SignInPage,
  validateSearch: searchSchema,
});
