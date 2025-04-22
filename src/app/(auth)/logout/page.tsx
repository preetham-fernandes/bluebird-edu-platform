// src/app/auth/logout/page.tsx
"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  useEffect(() => {
    // Automatically sign out when the page loads
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-2xl font-semibold">Signing out...</h1>
      </div>
    </div>
  );
}