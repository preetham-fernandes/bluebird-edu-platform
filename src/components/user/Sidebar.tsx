// src/components/user/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  BookOpen,  
  FileText, 
  Users, 
  User, 
  ChevronDown,
  ChevronRight,
  Pen,
  Plane,
} from 'lucide-react';
import { useState, useEffect } from 'react';

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: NavItem[];
};

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: 'Airbus A320',
    href: '/airbus-a320',
    icon: <Plane className="h-5 w-5" />,
    submenu: [
      {
        title: 'Test Series',
        href: '/airbus-a320/mock-test',
        icon: <Pen className="h-4 w-4" />,
      },
      {
        title: 'Practice Test',
        href: '/airbus-a320/practice-test',
        icon: <BookOpen className="h-4 w-4" />,
      },
      {
        title: 'Study Material',
        href: '/airbus-a320/study-material',
        icon: <FileText className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Boeing 737 MAX',
    href: '/dashboard',
    icon: <Plane className="h-5 w-5" />,
    submenu: [
      {
        title: 'Study Test',
        href: '/boeing-737-max/mock-test',
        icon: <Pen className="h-4 w-4" />,
      },
      {
        title: 'Practice Test',
        href: '/boeing-737-max/practice-test',
        icon: <BookOpen className="h-4 w-4" />,
      },
      {
        title: 'Study Material',
        href: '/boeing-737-max/study-material',
        icon: <FileText className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Community',
    href: '/community',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: <User className="h-5 w-5" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);

  // Automatically expand the active submenu
  useEffect(() => {
    const checkPathAndOpenMenu = () => {
      navItems.forEach(item => {
        if (item.submenu && pathname.startsWith(item.href)) {
          setOpenMenus(prev => ({ ...prev, [item.title]: true }));
        }
      });
    };
    
    checkPathAndOpenMenu();
    
    // Check if mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [pathname]);

  const toggleSubmenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside className="w-64 md:w-64 border-r border-border bg-card h-full overflow-y-auto">
      <div className="py-4 px-3">
        {/* Mobile profile info - shown only on mobile when sidebar is open */}
        {isMobile && (
          <div className="flex items-center mb-6 px-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Student Name</h3>
              <p className="text-xs text-muted-foreground">student@example.com</p>
            </div>
          </div>
        )}
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isOpen = openMenus[item.title];
            
            return (
              <div key={item.href} className="space-y-1">
                {hasSubmenu ? (
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={cn(
                      "flex items-center w-full rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="flex-1 text-left">{item.title}</span>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                )}
                
                {hasSubmenu && isOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu?.map((subItem) => {
                      const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href);
                      
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            isSubActive 
                              ? "bg-accent text-accent-foreground" 
                              : "hover:bg-accent/50 hover:text-accent-foreground"
                          )}
                        >
                          <span className="mr-3">{subItem.icon}</span>
                          <span>{subItem.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}