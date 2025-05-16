// src/app/(dashboard)/layout.tsx
"use client";

import { ReactNode, useState, useEffect } from 'react';
import Header from '@/components/user/Header';
import Sidebar from '@/components/user/Sidebar';
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  // Check authentication
  const { loading, authenticated } = useAuth({ required: true });
  
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
        setIsMobile(true);
      } else {
        setSidebarOpen(true);
        setIsMobile(false);
      }
    };
    
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        showMenuButton={isMobile} 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
      />
      <div className="flex flex-1 h-[calc(100vh-64px)] relative">
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div 
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            ${isMobile ? 'fixed inset-y-0 left-0 z-30' : 'relative'}
            transition-transform duration-200 ease-in-out
            md:translate-x-0
          `}
        >
          <Sidebar />
        </div>
        
        {/* Main content */}
        <SubscriptionProvider>
        <main className={`
          flex-1 p-4 md:p-6 overflow-y-auto
          ${isMobile ? 'w-full' : sidebarOpen ? '' : 'ml-0'}
        `}>
          {children}
        </main>
        </SubscriptionProvider>
      </div>
    </div>
  );
}