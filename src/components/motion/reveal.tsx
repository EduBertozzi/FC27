"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { type ComponentProps, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
};

/** Container que revela os filhos `RevealItem` em cascata. */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  // Com "reduzir movimento", o conteúdo aparece direto, sem fade nem deslocamento.
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={container}
      initial={reduce ? false : "hidden"}
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ className, ...props }: ComponentProps<typeof motion.div>) {
  return <motion.div variants={item} className={className} {...props} />;
}
