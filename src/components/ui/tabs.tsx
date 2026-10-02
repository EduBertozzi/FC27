"use client";

import { Tabs as TabsPrimitive } from "radix-ui";
import { type ComponentProps } from "react";

import { cn } from "@/lib/cn";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "-mx-4 flex scrollbar-none gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold text-fg-2 transition-[background-color,color] duration-200 hover:bg-surface-2 hover:text-fg",
        "data-[state=active]:bg-white data-[state=active]:text-on-accent [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("pt-5 focus-visible:outline-none", className)}
      {...props}
    />
  );
}
