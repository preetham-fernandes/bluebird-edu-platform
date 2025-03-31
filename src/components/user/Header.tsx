// src/components/dashboard/header.tsx
"use client";

import Link from 'next/link';
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
import { Bell, User, LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  showMenuButton?: boolean;
  onMenuClick?: () => void;
}

export default function Header({ showMenuButton = false, onMenuClick }: HeaderProps) {
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary hidden sm:block">
            <path d="M4 22H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 6L7 11L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 11H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 2L12 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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
              <Link href="/dashboard/profile" className="flex w-full">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/subscriptions" className="flex w-full">Subscriptions</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/settings" className="flex w-full">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}