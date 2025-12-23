'use client';

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, CardAction } from '@/components/ui/card';

// Wrapper components that use Card
export function CardWrapper({ className, children, ...props }: React.ComponentProps<"div">) {
  return <Card className={className} {...props}>{children}</Card>;
}

export function CardWrapperHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <CardHeader className={className} {...props} />;
}

export function CardWrapperTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <CardTitle className={className} {...props} />;
}

export function CardWrapperDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <CardDescription className={className} {...props} />;
}

export function CardWrapperContent({ className, ...props }: React.ComponentProps<"div">) {
  return <CardContent className={className} {...props} />;
}

export function CardWrapperFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <CardFooter className={className} {...props} />;
}

export function CardWrapperAction({ className, ...props }: React.ComponentProps<"div">) {
  return <CardAction className={className} {...props} />;
}

