"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";
import { create } from "zustand";

import { cn } from "@/lib/cn";

interface Toast {
  id: number;
  title: string;
  description?: string;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => set((s) => ({ toasts: [...s.toasts.slice(-2), { ...toast, id: nextId++ }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Confirmação de sucesso não bloqueante. */
export function toast(title: string, description?: string) {
  useToastStore.getState().push({ title, description });
}

function ToastItem({ toast: t }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  useEffect(() => {
    const timer = setTimeout(() => dismiss(t.id), 5000);
    return () => clearTimeout(timer);
  }, [dismiss, t.id]);
  return (
    <div className="pointer-events-auto flex w-full animate-sheet-up items-start gap-3 rounded-md bg-surface-2 p-3.5 shadow-(--shadow-pop) sm:w-96">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-win" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-fg">{t.title}</p>
        {t.description ? <p className="mt-0.5 text-sm text-fg-3">{t.description}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => dismiss(t.id)}
        aria-label="Dispensar aviso"
        className="-m-1 grid size-8 place-items-center rounded-sm text-fg-3 hover:bg-surface-3 hover:text-fg"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function Toaster({ className }: { className?: string }) {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end lg:bottom-6",
        className,
      )}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
