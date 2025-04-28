// src/hooks/use-auth.ts
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth({
  required = false,
  redirectTo = "/login",
  queryParams = "",
} = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === "loading";
  const authenticated = status === "authenticated";
  const redirectUrl = `${redirectTo}${queryParams ? `?${queryParams}` : ""}`;

  useEffect(() => {
    if (!loading && required && !authenticated) {
      router.push(redirectUrl);
    }
  }, [loading, required, authenticated, redirectUrl, router]);

  return { session, loading, authenticated };
}