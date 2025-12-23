"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import logo from '@/public/logo.png'

export function Navbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo bên trái */}
        <Link 
          href="/" 
          className="flex items-center space-x-2"
        >
          <span className="font-bold text-2xl">
            Flashup.
          </span>
        </Link>

        {/* Desktop Menu - Ẩn trên mobile */}
        <div className="hidden md:flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/" className={navigationMenuTriggerStyle()}>
                    Trang chủ
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/services/web" className={navigationMenuTriggerStyle()}>
                    Thiết kế Web
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/services/mobile" className={navigationMenuTriggerStyle()}>
                    Ứng dụng Mobile
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/services/consulting" className={navigationMenuTriggerStyle()}>
                    Tư vấn
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/services/support" className={navigationMenuTriggerStyle()}>
                    Hỗ trợ
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/about" className={navigationMenuTriggerStyle()}>
                    Về chúng tôi
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/contact" className={navigationMenuTriggerStyle()}>
                    Liên hệ
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        {/* Mobile Menu - Hiển thị trên mobile */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Mở menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[85vw] sm:w-[400px] bg-background/95 backdrop-blur-xl shadow-none border-none"
            >
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                <MobileNavLink href="/" onClick={() => setOpen(false)}>
                  Trang chủ
                </MobileNavLink>
                <MobileNavLink href="/services/web" onClick={() => setOpen(false)}>
                  Thiết kế Web
                </MobileNavLink>
                <MobileNavLink href="/services/mobile" onClick={() => setOpen(false)}>
                  Ứng dụng Mobile
                </MobileNavLink>
                <MobileNavLink href="/services/consulting" onClick={() => setOpen(false)}>
                  Tư vấn
                </MobileNavLink>
                <MobileNavLink href="/services/support" onClick={() => setOpen(false)}>
                  Hỗ trợ
                </MobileNavLink>
                <MobileNavLink href="/about" onClick={() => setOpen(false)}>
                  Về chúng tôi
                </MobileNavLink>
                <MobileNavLink href="/contact" onClick={() => setOpen(false)}>
                  Liên hệ
                </MobileNavLink>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

// Mobile Navigation Link Component
function MobileNavLink({
  href,
  children,
  onClick,
  className,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex items-center p-4 text-base font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
          className
        )}
      >
        {children}
      </Link>
    </SheetClose>
  );
}


