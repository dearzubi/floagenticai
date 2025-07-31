import { createFileRoute } from "@tanstack/react-router";
import MultiFactorVerification from "../../components/pages/multi-factor-verification";
import z from "zod";
import { navigate } from "../../router.tsx";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/_landing/multi-factor-verification")({
  component: MultiFactorVerification,
  validateSearch: searchSchema,
  onError: () => {
    navigate({
      to: "/signin",
    });
  },
});
