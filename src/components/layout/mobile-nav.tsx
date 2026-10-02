"use client";

import { Menu, Plus } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";

import { SurpriseTrigger } from "../ideas/surprise-dialog";
import { Dialog, DialogContent } from "../ui/dialog";
import { CareerSwitcher } from "./career-switcher";
import { MOBILE_TABS, MORE_NAV, isActive, type NavItem } from "./nav-config";

const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

function TabIndicator() {
  return (
    <motion.span
      layoutId="mobile-tab"
      transition={SPRING}
      className="absolute inset-0 rounded-full bg-white/16"
      aria-hidden="true"
    />
  );
}

function Tab({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(item, pathname);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[0.625rem] font-semibold",
        active ? "text-fg" : "text-fg-2",
      )}
    >
      {active ? <TabIndicator /> : null}
      <Icon className="relative size-[22px]" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
      <span className="relative">{item.label}</span>
    </Link>
  );
}

/** Barra de abas flutuante em vidro (mobile): 3 destinos, ação central e "Mais". */
export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE_NAV.some((item) => isActive(item, pathname));

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-28 bg-gradient-to-t from-bg via-bg/70 to-transparent lg:hidden"
      />
      <nav
        aria-label="Principal"
        className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 lg:hidden"
      >
        <div className="flex items-center gap-1 rounded-full border border-line bg-[rgb(14_20_36/0.86)] p-1.5 shadow-(--shadow-pop) backdrop-blur-2xl backdrop-saturate-150">
          {MOBILE_TABS.slice(0, 2).map((item) => (
            <Tab key={item.href} item={item} pathname={pathname} />
          ))}
          <Link
            href="/partidas/nova"
            aria-label="Registrar partida"
            className="mx-1 grid size-13 shrink-0 place-items-center rounded-full bg-white text-on-accent shadow-[0_6px_18px_rgb(255_255_255/0.25)] transition-transform active:scale-90"
          >
            <Plus className="size-6" strokeWidth={2.6} aria-hidden="true" />
          </Link>
          {MOBILE_TABS.slice(2).map((item) => (
            <Tab key={item.href} item={item} pathname={pathname} />
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            className={cn(
              "relative flex h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[0.625rem] font-semibold",
              moreActive ? "text-fg" : "text-fg-2",
            )}
          >
            {moreActive ? <TabIndicator /> : null}
            <Menu className="relative size-[22px]" aria-hidden="true" />
            <span className="relative">Mais</span>
          </button>
        </div>
      </nav>
      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent title="Mais" hideTitle>
          <div className="flex flex-col gap-4 pb-2">
            <CareerSwitcher />
            <ul className="grid grid-cols-2 gap-2">
              {MORE_NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item, pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-22 flex-col justify-between rounded-md p-3.5 text-sm font-semibold transition-colors",
                        active
                          ? "bg-white text-on-accent"
                          : "bg-surface-2 text-fg hover:bg-surface-3",
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <SurpriseTrigger onOpen={() => setMoreOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
