'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
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
      <header
        ref={combinedRef}
        className={cn(
          'sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline',
          className
        )}
        {...props}
      >
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
          {/* Left side */}
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
                  <NavigationMenuList className="flex-col flex w-fitl items-start gap-1">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index} className="w-full">
                        <Link
                          href={link.href}
                          className={cn(
                            "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer no-underline",
                            link.active 
                              ? "bg-accent text-accent-foreground" 
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
            {/* Main nav */}
            <div className="flex items-center gap-6">
              <Link 
                href={logoHref || '/'}
                className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
              >
                {logo || <span className="font-bold text-xl">toeup.</span>}
              </Link>
              {/* Navigation menu */}
              {!isMobile && (
                <NavigationMenu className="flex">
                <NavigationMenuList className="gap-1">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index}>
                      <Link
                        href={link.href}
                        className={cn(
                          "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer no-underline",
                          link.active 
                            ? "bg-accent text-accent-foreground" 
                            : "text-foreground/80 hover:text-foreground"
                        )}
                      >
                        {link.label}
                      </Link>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
                </NavigationMenu>
              )}
            </div>
          </div>
          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {onSignInClick ? (
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
            )}
          </div>
        </div>
      </header>
    );
  }
);

Navbar01.displayName = 'Navbar01';