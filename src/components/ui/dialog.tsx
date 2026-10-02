"use client";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

interface DialogContentProps extends Omit<ComponentProps<typeof DialogPrimitive.Content>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** Esconde o título visualmente (continua anunciado por leitores de tela). */
  hideTitle?: boolean;
  size?: "md" | "lg";
  footer?: ReactNode;
}

/**
 * Modal centrado no desktop e "bottom sheet" no mobile — mesma API.
 * Foco preso, Esc fecha, foco volta ao gatilho (Radix).
 */
export function DialogContent({
  title,
  description,
  hideTitle,
  size = "md",
  footer,
  className,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-scrim backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex max-h-[92dvh] flex-col bg-surface-1 shadow-(--shadow-overlay) focus:outline-none",
          "inset-x-0 bottom-0 rounded-t-lg data-[state=open]:animate-sheet-up",
          "sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[calc(100vw-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:data-[state=open]:animate-pop-in",
          size === "md" ? "sm:max-w-lg" : "sm:max-w-2xl",
          className,
        )}
        {...props}
      >
        <div
          className="mx-auto mt-2 h-1 w-10 rounded-full bg-line-strong sm:hidden"
          aria-hidden="true"
        />
        <header className={cn("flex items-start gap-3 px-5 pt-4 sm:pt-5", hideTitle && "sr-only")}>
          <div className="min-w-0 flex-1">
            <DialogPrimitive.Title className="font-display text-xl font-semibold text-fg">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-sm text-fg-3">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
        </header>
        {!description ? (
          <DialogPrimitive.Description className="sr-only">
            {typeof title === "string" ? title : ""}
          </DialogPrimitive.Description>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="safe-bottom flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </footer>
        ) : null}
        <DialogPrimitive.Close
          className="absolute top-3 right-3 grid size-10 place-items-center rounded-sm text-fg-3 hover:bg-surface-2 hover:text-fg"
          aria-label="Fechar"
        >
          <X className="size-5" aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
