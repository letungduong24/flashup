import { z } from "zod";
import { signUpRequestSchema } from "./signup.request";

export const userSchema = signUpRequestSchema.extend({
  id: z.number().int().positive(),
  birthday: z.coerce.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  address: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

