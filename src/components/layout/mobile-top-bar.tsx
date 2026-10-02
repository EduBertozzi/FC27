"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "./logo";

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/95 px-4 backdrop-blur lg:hidden">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-sm"
        aria-label="FC Career Companion — início"
      >
        <LogoMark className="size-7" />
        <span className="font-display text-lg font-bold tracking-wide">FC Career</span>
      </Link>
      <Link
        href="/assistente"
        className="flex h-10 items-center gap-2 rounded-full border border-ai/30 bg-ai-soft px-3.5 text-sm font-semibold text-ai"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        Assistente
      </Link>
    </header>
  );
}
