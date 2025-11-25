import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { FaGoogle } from "react-icons/fa";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required />
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
          <Input id="password" type="password" required />
        </Field>
        <Field>
          <Button type="submit">Đăng nhập</Button>
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
