"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthForm } from "@/components/auth/auth-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from 'next-themes';
import Image from "next/image";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const onSubmit = async (data: { email: string; password: string; provider?: string }) => {
    try {
      setError(null);

      if (data.provider === "google") {
        await signIn("google", { callbackUrl });
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (!result?.ok) {
        setError("Invalid email or password");
        return;
      }

      router.push(callbackUrl);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/bluebird-logo-white.svg"
              alt="Logo"
              width={48}
              height={48}
              className="w-10 h-10 sm:w-12 sm:h-12"
              style={theme === 'light' ? { filter: 'invert(1) sepia(1) saturate(5) hue-rotate(180deg)' } : {}}
            />
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              Enter your credentials to sign in to your account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mx-2 sm:mx-0">
              <AlertDescription className="text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Auth Form */}
          <div className="px-2 sm:px-0">
            <AuthForm type="login" onSubmit={onSubmit} />
          </div>

          {/* Footer Link */}
          <div className="text-center px-4 sm:px-0">
            <p className="text-sm sm:text-base text-muted-foreground">
              <Link
                href="/register"
                className="hover:text-brand underline underline-offset-4 font-medium py-2 px-1 -m-1 inline-block"
              >
                Don&apos;t have an account? Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Loading...</h1>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}