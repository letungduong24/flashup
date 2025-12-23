'use client';

import { SignupForm } from "@/components/signup-form"
import AuthGuard from "@/components/auth-guard"

export default function Signup() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/">
      <div className="flex-1 grid lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              FlashUp.
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <SignupForm />
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <img
            src="/2.webp"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </AuthGuard>
  )
}

