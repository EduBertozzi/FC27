"use client";

import { type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { useStoreHydrated } from "@/state/career-store";

import { Skeleton } from "../ui/feedback";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}

export function PageHeader({ title, description, actions, eyebrow }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1.5 text-sm text-fg-3">{eyebrow}</div> : null}
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          {title}
        </h1>
        {description ? <p className="mt-1.5 max-w-2xl text-fg-2">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function PageContainer({
  children,
  className,
  width = "default",
}: {
  children: ReactNode;
  className?: string;
  width?: "default" | "narrow";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 pt-6 sm:px-6 lg:px-10 lg:pt-10",
        width === "narrow" ? "max-w-3xl" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Carregando carreira">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-56 w-full rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  );
}

/** Espera a leitura do armazenamento local para não exibir a carreira errada por um frame. */
export function CareerGate({ children }: { children: ReactNode }) {
  const hydrated = useStoreHydrated();
  return hydrated ? <>{children}</> : <PageSkeleton />;
}
