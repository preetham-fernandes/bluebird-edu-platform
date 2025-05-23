// src/components/admin/Header.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import logo from "@/public/bluebird-logo-white.svg";
import { signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  showMenuButton?: boolean;
  onMenuClick?: () => void;
}

export default function Header({ showMenuButton = false, onMenuClick }: HeaderProps) {
  const { theme } = useTheme();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-3 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        {showMenuButton && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-1">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}
        
        <Link href="/dashboard" className="font-bold text-lg md:text-xl text-primary flex items-center gap-2">
        <Image
            src="/bluebird-logo-white.svg"
            alt="Logo"
            width={40}
            height={40}
            style={theme === 'light' ? { filter: 'invert(1) sepia(1) saturate(5) hue-rotate(180deg)' } : {}}
          />
        <span>BlueBird-Edu</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/dashboard/settings" className="flex w-full">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive cursor-pointer"
              onSelect={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}