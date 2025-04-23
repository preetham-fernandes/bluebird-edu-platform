"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    console.log("Auth error params:", Object.fromEntries(searchParams.entries()));
    
    if (errorParam) {
      console.error("Auth error type:", errorParam);
      switch (errorParam) {
        case "OAuthSignin":
        case "OAuthCallback":
        case "OAuthCreateAccount":
        case "EmailCreateAccount":
        case "Callback":
          setError("There was a problem with the authentication service. Please try again.");
          break;
        case "CredentialsSignin":
          setError("Invalid email or password. Please check your credentials and try again.");
          break;
        case "SessionRequired":
          setError("You must be signed in to access this page.");
          break;
        default:
          setError("An unknown error occurred during authentication.");
          break;
      }
    }
  }, [searchParams]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Alert variant="destructive">
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{error || "An error occurred during authentication."}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/auth/login">Return to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}