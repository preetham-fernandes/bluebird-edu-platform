// src/hooks/use-admin.ts
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAdmin({
  redirectTo = "/dashboard",
} = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === "loading";
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push(redirectTo);
    }
  }, [loading, isAdmin, redirectTo, router]);

  return { session, loading, isAdmin };
}