import { z } from "zod";

export const signUpRequestSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có tối thiểu 6 ký tự"),
});

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;
