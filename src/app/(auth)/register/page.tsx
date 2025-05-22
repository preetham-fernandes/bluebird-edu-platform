"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthForm } from "@/components/auth/auth-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RegisterFormData {
  name?: string;
  email: string;
  password: string;
  provider?: "credentials" | "google";
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      
      if (data.provider === "google") {
        await signIn("google", { callbackUrl: "/dashboard" });
        return;
      }
      
      // Register with credentials
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setError(error || "Something went wrong. Please try again.");
        return;
      }

      // Sign in the user
      await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details to create your account
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AuthForm type="register" onSubmit={onSubmit} />

        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="hover:text-brand underline underline-offset-4"
          >
            Already have an account? Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}