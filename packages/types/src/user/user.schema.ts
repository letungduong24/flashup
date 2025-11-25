import { z } from "zod";
import { signUpRequestSchema } from "./signup.request";

export const userSchema = signUpRequestSchema.extend({
  id: z.cuid(),
  birthday: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  phone: z.string().nullish(),
  gender: z.string().nullish(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  address: z.string().nullish(),
});

export type User = z.infer<typeof userSchema>;

// User response schema without password (for API responses)
// API không trả về password nên cần schema riêng
export const userResponseSchema = userSchema.omit({ password: true });

export type UserResponse = z.infer<typeof userResponseSchema>;

