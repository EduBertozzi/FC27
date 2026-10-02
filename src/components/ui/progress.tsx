"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/cn";

interface ProgressBarProps {
  value: number; // 0–1
  label: string;
  tone?: "accent" | "win" | "ai";
  className?: string;
}

const FILL = { accent: "bg-white", win: "bg-win", ai: "bg-ai" } as const;

export function ProgressBar({ value, label, tone = "accent", className }: ProgressBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cn("h-1.5 overflow-hidden rounded-full bg-white/15", className)}
    >
      <motion.div
        className={cn("h-full rounded-full", FILL[tone])}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      />
    </div>
  );
}
