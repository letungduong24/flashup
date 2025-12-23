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
import { signUpRequestSchema, type SignUpRequest } from "@/types/auth";
import useAuthStore from "@/store/auth.store";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { signup, signUpLoading } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpRequest>({
    resolver: zodResolver(signUpRequestSchema),
  });

  const onSubmit = async (data: SignUpRequest) => {
    try {
      await signup(data);
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
          <h1 className="text-2xl font-bold">Đăng ký</h1>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Tên</FieldLabel>
          <Input 
            id="name" 
            type="text" 
            placeholder="Nhập tên của bạn" 
            {...register("name")}
            aria-invalid={errors.name ? "true" : "false"}
          />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>
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
          <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
          <Input 
            id="password" 
            type="password" 
            placeholder="Tối thiểu 6 ký tự"
            {...register("password")}
            aria-invalid={errors.password ? "true" : "false"}
          />
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>
        <Field>
          <Button type="submit" disabled={signUpLoading}>
            {signUpLoading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </Field>
        <FieldSeparator>Hoặc đăng ký với</FieldSeparator>
        <Field>
          <Button variant="outline" type="button">
            <FaGoogle />
            Đăng ký với Google
          </Button>
          <FieldDescription className="text-center">
            Đã có tài khoản?{" "}
            <a href="/signin" className="underline underline-offset-4">
              Đăng nhập
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}

