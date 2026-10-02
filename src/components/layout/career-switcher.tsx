"use client";

import { Check, ChevronsUpDown, Plus, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { displayName } from "@/domain/player/player";
import { cn } from "@/lib/cn";
import { useActiveCareer, useCareerStore, useStoreHydrated } from "@/state/career-store";

import { PlayerShirt } from "../football/player-shirt";
import { Skeleton } from "../ui/feedback";
import { toast } from "../ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function CareerSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const career = useActiveCareer();
  const careers = useCareerStore((s) => s.careers);
  const setActive = useCareerStore((s) => s.setActiveCareer);
  const resetDemo = useCareerStore((s) => s.resetDemo);
  const hydrated = useStoreHydrated();

  if (!hydrated) return <Skeleton className={cn("h-[62px] w-full rounded-md", className)} />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-3 rounded-md border border-line bg-surface-1 p-2.5 text-left transition-colors hover:border-line-strong hover:bg-surface-2",
          className,
        )}
        aria-label={`Carreira ativa: ${displayName(career.player)}. Trocar de carreira`}
      >
        <PlayerShirt number={career.player.shirtNumber} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-fg">{displayName(career.player)}</span>
          <span className="block truncate text-xs text-fg-3">
            {career.currentClub} · {career.currentSeason}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-fg-3" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-64"
      >
        <DropdownMenuLabel>Suas carreiras</DropdownMenuLabel>
        {Object.values(careers).map((c) => (
          <DropdownMenuItem key={c.id} onSelect={() => setActive(c.id)}>
            <PlayerShirt number={c.player.shirtNumber} size="sm" className="size-8 text-xs" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-fg">{displayName(c.player)}</span>
              <span className="block truncate text-xs text-fg-3">{c.currentClub}</span>
            </span>
            {c.id === career.id ? <Check className="text-accent!" aria-label="Ativa" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/nova-carreira")}>
          <Plus aria-hidden="true" />
          Nova carreira
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            resetDemo();
            toast("Demonstração restaurada", "Os dados de exemplo voltaram ao estado original.");
          }}
        >
          <RotateCcw aria-hidden="true" />
          Restaurar dados de demonstração
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
