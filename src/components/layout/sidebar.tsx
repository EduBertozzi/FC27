"use client";

import { Mic, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

import { SurpriseTrigger } from "../ideas/surprise-dialog";
import { Button } from "../ui/button";
import { CareerSwitcher } from "./career-switcher";
import { Logo } from "./logo";
import { COMPANION_NAV, META_NAV, PRIMARY_NAV, isActive, type NavItem } from "./nav-config";

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(item, pathname);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 items-center gap-3 rounded-sm px-3 text-sm font-medium transition-colors",
        active ? "bg-surface-2 text-fg" : "text-fg-2 hover:bg-surface-1 hover:text-fg",
      )}
    >
      <Icon
        className={cn("size-[18px]", active ? "text-accent" : "text-fg-3")}
        aria-hidden="true"
      />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-bg lg:flex">
      <div className="px-5 pt-6 pb-5">
        <Link
          href="/"
          aria-label="FC Career Companion — início"
          className="inline-block rounded-sm"
        >
          <Logo />
        </Link>
      </div>
      <div className="px-3">
        <CareerSwitcher />
      </div>
      <nav aria-label="Principal" className="mt-5 flex flex-1 flex-col gap-6 overflow-y-auto px-3">
        <ul className="flex flex-col gap-0.5">
          {PRIMARY_NAV.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} />
            </li>
          ))}
        </ul>
        <div>
          <p className="px-3 pb-1.5 text-xs font-medium text-fg-3">Companion</p>
          <ul className="flex flex-col gap-0.5">
            {COMPANION_NAV.map((item) => (
              <li key={item.href}>
                <NavLink item={item} pathname={pathname} />
              </li>
            ))}
          </ul>
        </div>
        <ul className="mt-auto flex flex-col gap-0.5 pb-2">
          {META_NAV.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} />
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex flex-col gap-2 border-t border-line p-3">
        <Button asChild>
          <Link href="/partidas/nova">
            <Plus className="size-5" aria-hidden="true" />
            Registrar partida
          </Link>
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/partidas/nova?modo=voz">
              <Mic className="size-4" aria-hidden="true" />
              Por voz
            </Link>
          </Button>
          <SurpriseTrigger variant="secondary" size="sm" compact />
        </div>
      </div>
    </aside>
  );
}
