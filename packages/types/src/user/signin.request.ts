import { z } from "zod";

export const signInRequestSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có tối thiểu 6 ký tự"),
});

export type SignInRequest = z.infer<typeof signInRequestSchema>;
