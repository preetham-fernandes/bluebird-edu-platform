// src/app/obm-admin/layout.tsx
"use client";

import { ReactNode, useState, useEffect } from 'react';
import Header from '@/components/admin/Header';
import Sidebar from '@/components/admin/Sidebar';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
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
        <main className={`
          flex-1 p-4 md:p-6 overflow-y-auto
          ${isMobile ? 'w-full' : sidebarOpen ? '' : 'ml-0'}
        `}>
          {children}
        </main>
      </div>
    </div>
  );
}