import {
  Award,
  Flag,
  Footprints,
  Goal,
  HeartPulse,
  type LucideIcon,
  Medal,
  Mic2,
  PenLine,
  Plane,
  Shirt,
  Sparkles,
  Star,
  Swords,
  Trophy,
} from "lucide-react";

import { type TimelineEventType } from "@/domain/timeline/events";

export type EventTone = "accent" | "win" | "loss" | "ai" | "neutral";

export const EVENT_META: Record<TimelineEventType, { icon: LucideIcon; tone: EventTone }> = {
  debut: { icon: Shirt, tone: "accent" },
  "first-goal": { icon: Goal, tone: "accent" },
  "first-assist": { icon: Footprints, tone: "accent" },
  milestone: { icon: Flag, tone: "accent" },
  transfer: { icon: Plane, tone: "ai" },
  renewal: { icon: PenLine, tone: "ai" },
  "call-up": { icon: Star, tone: "win" },
  injury: { icon: HeartPulse, tone: "loss" },
  title: { icon: Trophy, tone: "accent" },
  award: { icon: Medal, tone: "accent" },
  record: { icon: Award, tone: "accent" },
  rivalry: { icon: Swords, tone: "loss" },
  interview: { icon: Mic2, tone: "neutral" },
  special: { icon: Sparkles, tone: "ai" },
};

export const TONE_CLASSES: Record<EventTone, string> = {
  accent: "bg-accent-soft text-accent",
  win: "bg-win-soft text-win",
  loss: "bg-loss-soft text-loss",
  ai: "bg-ai-soft text-ai",
  neutral: "bg-surface-3 text-fg-2",
};
