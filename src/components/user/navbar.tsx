// src/components/navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plane, User, LogOut, Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Skip navbar on auth pages
  if (pathname.startsWith("/auth/") || pathname === "/onboarding") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">BlueBird Edu</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className={pathname === "/dashboard" ? "text-primary font-medium" : "text-foreground/60 hover:text-foreground"}
          >
            Dashboard
          </Link>
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onSelect={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          )}
        </nav>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          className="flex md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="container py-4 space-y-4">
            <Link
              href="/dashboard"
              className="block py-2 text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            {status === "authenticated" ? (
              <>
                <Link
                  href="/profile"
                  className="block py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start pl-0"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </>
            ) : (
              <Button asChild className="w-full">
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}