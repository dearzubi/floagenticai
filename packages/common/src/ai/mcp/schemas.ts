import { z } from "zod/v4";

export const mcpServerCategories = z.enum([
  "Web Search",
  "Database",
  "Cloud Storage",
  "Communication",
  "Analytics",
  "Development Tools",
  "AI Services",
  "Productivity",
  "Date and Time",
] as const);

export type MCPServerCategory = z.infer<typeof mcpServerCategories>;

export const mcpServerDescriptionSchema = z.object({
  name: z.string().nonempty(),
  label: z.string().nonempty(),
  description: z.string().nonempty(),
  icon: z.string().optional(),
  category: mcpServerCategories,
  tools: z.array(z.string()),
  credential: z.string().optional(),
});

export type MCPServerDescription = z.infer<typeof mcpServerDescriptionSchema>;
