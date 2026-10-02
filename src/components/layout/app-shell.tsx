"use client";

import { MotionConfig } from "motion/react";
import { type ReactNode } from "react";

import { StoreHydrator } from "@/state/career-store";

import { Toaster } from "../ui/toast";
import { TooltipProvider } from "../ui/tooltip";
import { Backdrop } from "./backdrop";
import { MobileNav } from "./mobile-nav";
import { MobileTopBar } from "./mobile-top-bar";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <StoreHydrator />
        <Backdrop />
        <a
          href="#conteudo"
          className="sr-only z-[70] rounded-sm bg-accent px-4 py-2 font-semibold text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Pular para o conteúdo
        </a>
        <div className="flex min-h-dvh">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <MobileTopBar />
            <main id="conteudo" tabIndex={-1} className="flex-1 pb-28 focus:outline-none lg:pb-12">
              {children}
            </main>
          </div>
        </div>
        <MobileNav />
        <Toaster />
      </TooltipProvider>
    </MotionConfig>
  );
}
