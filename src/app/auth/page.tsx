"use client";

import { AuthForm } from "@/components/auth/auth-form";

export default function AuthPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center py-8">
      <AuthForm />
    </div>
  );
}
