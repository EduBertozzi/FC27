"use client";

import { Tooltip as Primitive } from "radix-ui";
import { type ReactNode } from "react";

export const TooltipProvider = Primitive.Provider;

/** Tooltip para informação complementar — nunca para conteúdo essencial. */
export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <Primitive.Root delayDuration={250}>
      <Primitive.Trigger asChild>{children}</Primitive.Trigger>
      <Primitive.Portal>
        <Primitive.Content
          side={side}
          sideOffset={6}
          className="z-50 max-w-64 rounded-sm bg-sheet px-2.5 py-1.5 text-xs text-fg shadow-(--shadow-pop) data-[state=delayed-open]:animate-fade-in"
        >
          {content}
          <Primitive.Arrow className="fill-[#101626]" />
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
