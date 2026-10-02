"use client";

import { Mic, Plus } from "lucide-react";
import { motion } from "motion/react";
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
        "relative flex h-10 items-center gap-3 rounded-full px-3.5 text-sm font-medium transition-colors",
        active ? "text-on-accent" : "text-fg-2 hover:bg-surface-2 hover:text-fg",
      )}
    >
      {active ? (
        <motion.span
          layoutId="sidebar-active"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className="absolute inset-0 rounded-full bg-white"
          aria-hidden="true"
        />
      ) : null}
      <Icon className="relative size-[18px]" aria-hidden="true" />
      <span className="relative">{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="glass sticky top-3 m-3 mr-0 hidden h-[calc(100dvh-1.5rem)] w-64 shrink-0 flex-col rounded-lg lg:flex">
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
      <div className="flex flex-col gap-2 p-3">
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
