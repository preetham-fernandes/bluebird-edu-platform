"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTheme } from 'next-themes';
import Image from "next/image";

interface ErrorInfo {
  title: string;
  message: string;
  suggestions: string[];
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

function ErrorContent() {
  const searchParams = useSearchParams();
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const callbackUrl = searchParams.get("callbackUrl");
    
    console.log("Auth error params:", Object.fromEntries(searchParams.entries()));
    
    setIsLoading(false);
    
    if (errorParam) {
      console.error("Auth error type:", errorParam);
      
      let info: ErrorInfo;
      
      switch (errorParam) {
        case "OAuthSignin":
        case "OAuthCallback":
          info = {
            title: "OAuth Authentication Failed",
            message: "There was a problem connecting to your OAuth provider (Google, etc.). This might be temporary.",
            suggestions: [
              "Check your internet connection",
              "Try signing in again in a few minutes",
              "Clear your browser cache and cookies"
            ],
            primaryAction: {
              label: "Try OAuth Again",
              href: "/login"
            },
            secondaryAction: {
              label: "Use Email Instead",
              href: "/login"
            }
          };
          break;
          
        case "OAuthCreateAccount":
        case "EmailCreateAccount":
          info = {
            title: "Account Creation Failed",
            message: "We couldn't create your account. The email might already be registered with a different sign-in method.",
            suggestions: [
              "Try signing in instead of creating an account",
              "Use a different email address",
              "Contact support if this persists"
            ],
            primaryAction: {
              label: "Sign In Instead",
              href: "/login"
            },
            secondaryAction: {
              label: "Create New Account",
              href: "/register"
            }
          };
          break;
          
        case "CredentialsSignin":
          info = {
            title: "Sign In Failed",
            message: "The email or password you entered is incorrect. Please double-check your credentials.",
            suggestions: [
              "Make sure your email is spelled correctly",
              "Check if Caps Lock is on",
              "Try resetting your password if you've forgotten it"
            ],
            primaryAction: {
              label: "Try Again",
              href: "/login"
            },
            secondaryAction: {
              label: "Reset Password",
              href: "/forgot-password"
            }
          };
          break;
          
        case "SessionRequired":
          info = {
            title: "Sign In Required",
            message: "You need to be signed in to access this page. Please sign in to continue.",
            suggestions: [
              "Sign in with your existing account",
              "Create a new account if you don't have one"
            ],
            primaryAction: {
              label: "Sign In",
              href: callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"
            },
            secondaryAction: {
              label: "Create Account",
              href: "/register"
            }
          };
          break;
          
        case "Callback":
          info = {
            title: "Authentication Callback Error",
            message: "There was a problem processing your authentication. This might be due to an expired or invalid request.",
            suggestions: [
              "Try signing in again from the beginning",
              "Make sure you're using a supported browser",
              "Check if cookies are enabled"
            ],
            primaryAction: {
              label: "Start Over",
              href: "/login"
            }
          };
          break;
          
        default:
          info = {
            title: "Authentication Error",
            message: "An unexpected error occurred during authentication. Please try again or contact support if this continues.",
            suggestions: [
              "Try refreshing the page",
              "Clear your browser data",
              "Try a different browser"
            ],
            primaryAction: {
              label: "Try Again",
              href: "/login"
            },
            secondaryAction: {
              label: "Contact Support",
              href: "/contact"
            }
          };
          break;
      }
      
      setErrorInfo(info);
    } else {
      // No specific error, show generic message
      setErrorInfo({
        title: "Something Went Wrong",
        message: "We encountered an unexpected issue. Don't worry, this happens sometimes.",
        suggestions: [
          "Try refreshing the page",
          "Go back to the homepage",
          "Contact support if the problem persists"
        ],
        primaryAction: {
          label: "Go to Homepage",
          href: "/"
        },
        secondaryAction: {
          label: "Sign In",
          href: "/login"
        }
      });
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
            <div className="flex justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded animate-pulse" />
            </div>
            <Alert>
              <AlertTitle>Loading...</AlertTitle>
              <AlertDescription>Please wait while we process your request.</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm sm:max-w-lg space-y-6 sm:space-y-8">
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

          {/* Error Alert */}
          <Alert variant="destructive" className="mx-2 sm:mx-0">
            <AlertTitle className="text-base sm:text-lg font-semibold">
              {errorInfo?.title || "Error"}
            </AlertTitle>
            <AlertDescription className="text-sm sm:text-base mt-2">
              {errorInfo?.message || "An error occurred."}
            </AlertDescription>
          </Alert>

          {/* Suggestions */}
          {errorInfo?.suggestions && errorInfo.suggestions.length > 0 && (
            <div className="mx-2 sm:mx-0 space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                What you can try:
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {errorInfo.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-muted-foreground/60 mt-1 text-xs">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 px-2 sm:px-0">
            <Button asChild className="w-full h-11 sm:h-10 text-base sm:text-sm font-medium">
              <Link href={errorInfo?.primaryAction?.href || "/login"}>
                {errorInfo?.primaryAction?.label || "Return to Login"}
              </Link>
            </Button>
            
            {errorInfo?.secondaryAction && (
              <Button 
                asChild 
                variant="outline" 
                className="w-full h-11 sm:h-10 text-base sm:text-sm font-medium"
              >
                <Link href={errorInfo.secondaryAction.href}>
                  {errorInfo.secondaryAction.label}
                </Link>
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center px-4 sm:px-0">
            <p className="text-xs sm:text-sm text-muted-foreground">
              If you continue experiencing issues, please{" "}
              <Link 
                href="/contact" 
                className="underline underline-offset-4 hover:text-foreground font-medium"
              >
                contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
            <div className="flex justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded animate-pulse" />
            </div>
            <Alert>
              <AlertTitle>Loading...</AlertTitle>
              <AlertDescription>Please wait while we process your request.</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}