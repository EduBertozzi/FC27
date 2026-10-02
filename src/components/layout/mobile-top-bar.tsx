"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoMark } from "./logo";

export function MobileTopBar() {
  const onAssistant = usePathname().startsWith("/assistente");
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 backdrop-blur-xl [background:linear-gradient(180deg,rgb(5_11_24/0.75),rgb(5_11_24/0.35))] lg:hidden">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-full"
        aria-label="FC Career Companion — início"
      >
        <LogoMark className="size-7" />
        <span className="text-[1.0625rem] font-semibold tracking-tight">Career</span>
      </Link>
      {onAssistant ? null : (
        <Link
          href="/assistente"
          className="glass flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold"
        >
          <Sparkles className="size-4 text-ai" aria-hidden="true" />
          Assistente
        </Link>
      )}
    </header>
  );
}
