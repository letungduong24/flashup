import { z } from "zod";

export const signUpRequestSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có tối thiểu 6 ký tự"),
});

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;

export const signInRequestSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có tối thiểu 6 ký tự"),
});

export type SignInRequest = z.infer<typeof signInRequestSchema>;

const userSchema = signUpRequestSchema.extend({
  id: z.string(),
  birthday: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  phone: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  address: z.string().nullable().optional(),
});

export const userResponseSchema = userSchema.omit({ password: true });

export type UserResponse = z.infer<typeof userResponseSchema>;


