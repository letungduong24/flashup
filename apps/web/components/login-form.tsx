'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { FaGoogle } from "react-icons/fa";
import { signInRequestSchema, type SignInRequest } from "@repo/types";
import useAuthStore from "@/store/auth.store";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { signin, signInLoading } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInRequest>({
    resolver: zodResolver(signInRequestSchema),
  });

  const onSubmit = async (data: SignInRequest) => {
    try {
      await signin(data);
      router.push('/');
    } catch (error) {
      // Error đã được xử lý trong store
    }
  };

  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
          />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>
          <Input 
            id="password" 
            type="password" 
            {...register("password")}
            aria-invalid={errors.password ? "true" : "false"}
          />
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>
        <Field>
          <Button type="submit" disabled={signInLoading}>
            {signInLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </Field>
        <FieldSeparator>Hoặc đăng nhập với</FieldSeparator>
        <Field>
          <Button variant="outline" type="button">
            <FaGoogle />
            Đăng nhập với Google
          </Button>
          <FieldDescription className="text-center">
            Chưa có tài khoản?{" "}
            <a href="/signup" className="underline underline-offset-4">
              Đăng ký
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
