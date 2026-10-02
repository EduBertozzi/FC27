"use client";

import { DropdownMenu as Primitive } from "radix-ui";
import { type ComponentProps } from "react";

import { cn } from "@/lib/cn";

export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
export const DropdownMenuGroup = Primitive.Group;

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-56 rounded-md border border-line bg-sheet p-1.5 shadow-(--shadow-pop) backdrop-blur-2xl data-[state=open]:animate-pop-in",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item
      className={cn(
        "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-sm px-2.5 text-sm text-fg-2 outline-none select-none",
        "data-[disabled]:opacity-50 data-[highlighted]:bg-surface-3 data-[highlighted]:text-fg [&_svg]:size-4 [&_svg]:text-fg-3",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof Primitive.Label>) {
  return (
    <Primitive.Label
      className={cn("px-2.5 pt-2 pb-1 text-xs font-medium text-fg-3", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof Primitive.Separator>) {
  return <Primitive.Separator className={cn("my-1 h-px bg-line", className)} {...props} />;
}
