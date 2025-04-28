// src/components/providers/auth-provider.tsx
"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";

// Debug component to log session changes
function SessionDebug({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  
  useEffect(() => {
    console.log("Current session in client:", session);
  }, [session]);
  
  return <>{children}</>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SessionDebug>{children}</SessionDebug>
    </SessionProvider>
  );
}