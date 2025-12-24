'use client';

import { SignupForm } from "@/components/signup-form"
import AuthGuard from "@/components/auth-guard"

export default function Signup() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/">
      <div className="w-full flex-1 flex justify-center items-center p-4 md:p-0">
        <div className="w-full max-w-2xl p-6 md:p-8 border rounded-2xl">
          <SignupForm />
        </div>
      </div>
    </AuthGuard>
  )
}

