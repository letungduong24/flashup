'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { IoMenuOutline } from "react-icons/io5";
import useAuthStore from '@/store/auth.store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, ChevronDown } from 'lucide-react';

// Types
export interface Navbar01NavLink {
  href: string;
  label: string;
  active?: boolean;
}

export interface Navbar01Props extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: Navbar01NavLink[];
  signInText?: string;
  signInHref?: string;
  ctaText?: string;
  ctaHref?: string;
  onSignInClick?: () => void;
  onCtaClick?: () => void;
}

// Default navigation links
const defaultNavigationLinks: Navbar01NavLink[] = [
  { href: '/', label: 'Trang chủ', active: true },
  { href: '/pricing', label: 'Thành viên' },
  { href: '/about', label: 'Về chúng tôi' },
];

export const Navbar01 = React.forwardRef<HTMLElement, Navbar01Props>(
  (
    {
      className,
      logo,
      logoHref,
      navigationLinks = defaultNavigationLinks,
      signInText = 'Đăng nhập',
      signInHref = '/signin',
      onSignInClick,
      onCtaClick,
      ...props
    },
    ref
  ) => {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLElement>(null);
    const { user, loading, signout } = useAuthStore();

    useEffect(() => {
      const checkWidth = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          setIsMobile(width < 768); // 768px is md breakpoint
        }
      };

      checkWidth();

      const resizeObserver = new ResizeObserver(checkWidth);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    // Combine refs
    const combinedRef = React.useCallback((node: HTMLElement | null) => {
      containerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    return (
      <div className="sticky top-0 z-50 w-full px-4 md:px-6 py-3">
        <header
          ref={combinedRef}
          className={cn(
            'w-full bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 rounded-2xl shadow-sm dark:shadow-[0_2px_8px_0_rgb(255_255_255_/_0.15),0_1px_4px_-1px_rgb(255_255_255_/_0.1)] border border-border/50 px-4 md:px-6 [&_*]:no-underline',
            className
          )}
          {...props}
        >
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Left side - Brand */}
            <div className="flex items-center gap-2">
              {/* Mobile menu trigger */}
              {isMobile && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                      variant="ghost"
                      size="icon"
                    >
                      <IoMenuOutline />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-fit">
                    <NavigationMenu className="w-full">
                      <NavigationMenuList className="flex-col flex w-fit items-start gap-1">
                        {navigationLinks.map((link, index) => (
                          <NavigationMenuItem key={index} className="w-full">
                            <Link
                              href={link.href}
                                className={cn(
                                  "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer no-underline",
                                  link.active 
                                    ? "bg-orange-500 text-white hover:bg-orange-600" 
                                    : "text-foreground/80"
                                )}
                            >
                              {link.label}
                            </Link>
                          </NavigationMenuItem>
                        ))}
                      </NavigationMenuList>
                    </NavigationMenu>
                  </PopoverContent>
                </Popover>
              )}
              {/* Brand/Logo */}
              <Link 
                href={logoHref || '/'}
                className="flex items-center justify-center rounded-full bg-background text-sm font-bold cursor-pointer no-underline"
              >
                {logo || <span className="font-bold text-xl hover:text-orange-600 transition-colors text-orange-500">flashup.</span>}
              </Link>
            </div>

            {/* Center - Navigation Links */}
            {!isMobile && (
              <div className="flex-1 flex items-center justify-center gap-1">
                <NavigationMenu className="flex">
                  <NavigationMenuList className="gap-1">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index}>
                        <Link
                          href={link.href}
                          className={cn(
                            "group inline-flex h-9 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer no-underline",
                            link.active 
                              ? "bg-orange-500 text-white hover:bg-orange-600" 
                              : "text-foreground/80 hover:bg-accent hover:text-foreground"
                          )}
                        >
                          {link.label}
                        </Link>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            )}

            {/* Right side - Utility Icons */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {!loading && user ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="default"
                      size="sm"
                      className="text-sm font-medium"
                    >
                      Học tập
                    </Button>
                  </Link>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full hover:bg-accent"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-1">
                      <div className="flex flex-col gap-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer no-underline"
                        >
                          <User className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        <button
                          onClick={async () => {
                            await signout();
                            router.push('/');
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-left w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </>
              ) : (
                onSignInClick ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    onClick={onSignInClick}
                  >
                    {signInText}
                  </Button>
                ) : (
                  <Link href={signInHref}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      {signInText}
                    </Button>
                  </Link>
                )
              )}
            </div>
          </div>
        </header>
      </div>
    );
  }
);

Navbar01.displayName = 'Navbar01';