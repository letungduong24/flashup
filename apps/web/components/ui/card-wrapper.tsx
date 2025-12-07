'use client';

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, CardAction } from '@/components/ui/card';
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle, GlassCardFooter, GlassCardAction } from '@/components/ui/glass-card';
import { useThemeStore } from '@/store/theme.store';

// Wrapper components that automatically choose between Card and GlassCard based on theme
export function CardWrapper({ className, children, ...props }: React.ComponentProps<"div">) {
  const { themeMode } = useThemeStore();
  
  if (themeMode === 'glass') {
    return <GlassCard className={className} {...props}>{children}</GlassCard>;
  }
  return <Card className={className} {...props}>{children}</Card>;
}

export function CardWrapperHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { themeMode } = useThemeStore();
  
  if (themeMode === 'glass') {
    return <GlassCardHeader className={className} {...props} />;
  }
  return <CardHeader className={className} {...props} />;
}

export function CardWrapperTitle({ className, ...props }: React.ComponentProps<"div">) {
  const { themeMode } = useThemeStore();
  
  if (themeMode === 'glass') {
    return <GlassCardTitle className={className} {...props} />;
  }
  return <CardTitle className={className} {...props} />;
}

export function CardWrapperDescription({ className, ...props }: React.ComponentProps<"div">) {
  const { themeMode } = useThemeStore();
  
  if (themeMode === 'glass') {
    return <GlassCardDescription className={className} {...props} />;
  }
  return <CardDescription className={className} {...props} />;
}

export function CardWrapperContent({ className, ...props }: React.ComponentProps<"div">) {
  const { themeMode } = useThemeStore();
  
  if (themeMode === 'glass') {
    return <GlassCardContent className={className} {...props} />;
  }
  return <CardContent className={className} {...props} />;
}

export function CardWrapperFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { themeMode } = useThemeStore();
  
  if (themeMode === 'glass') {
    return <GlassCardFooter className={className} {...props} />;
  }
  return <CardFooter className={className} {...props} />;
}

export function CardWrapperAction({ className, ...props }: React.ComponentProps<"div">) {
  const { themeMode } = useThemeStore();
  
  if (themeMode === 'glass') {
    return <GlassCardAction className={className} {...props} />;
  }
  return <CardAction className={className} {...props} />;
}

