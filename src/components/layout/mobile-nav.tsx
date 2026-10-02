"use client";

import { Menu, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";

import { SurpriseTrigger } from "../ideas/surprise-dialog";
import { Dialog, DialogContent } from "../ui/dialog";
import { CareerSwitcher } from "./career-switcher";
import { MOBILE_TABS, MORE_NAV, isActive, type NavItem } from "./nav-config";

function Tab({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(item, pathname);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-full flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium",
        active ? "text-fg" : "text-fg-3",
      )}
    >
      <Icon className={cn("size-[22px]", active && "text-accent")} aria-hidden="true" />
      {item.label}
    </Link>
  );
}

/** Navegação inferior do mobile: 4 destinos + ação central de registro. */
export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE_NAV.some((item) => isActive(item, pathname));

  return (
    <>
      <nav
        aria-label="Principal"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur lg:hidden"
      >
        <div className="flex h-16 items-stretch">
          {MOBILE_TABS.slice(0, 2).map((item) => (
            <Tab key={item.href} item={item} pathname={pathname} />
          ))}
          <div className="flex flex-1 items-center justify-center">
            <Link
              href="/partidas/nova"
              aria-label="Registrar partida"
              className="-mt-6 grid size-14 place-items-center rounded-full bg-accent text-on-accent shadow-[0_0_0_6px_var(--bg)] transition-transform active:scale-95"
            >
              <Plus className="size-7" aria-hidden="true" />
            </Link>
          </div>
          {MOBILE_TABS.slice(2).map((item) => (
            <Tab key={item.href} item={item} pathname={pathname} />
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            className={cn(
              "flex h-full flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium",
              moreActive ? "text-fg" : "text-fg-3",
            )}
          >
            <Menu className={cn("size-[22px]", moreActive && "text-accent")} aria-hidden="true" />
            Mais
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
                        "flex h-20 flex-col justify-between rounded-md border p-3 text-sm font-medium",
                        active
                          ? "border-accent/50 bg-surface-2 text-fg"
                          : "border-line bg-surface-2/50 text-fg-2",
                      )}
                    >
                      <Icon
                        className={cn("size-5", active ? "text-accent" : "text-fg-3")}
                        aria-hidden="true"
                      />
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
