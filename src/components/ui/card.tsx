import { type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("rounded-md border border-line bg-surface-1", className)} {...props} />
  );
}

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
  /** Nível do título — mantém a hierarquia de headings correta por página. */
  as?: "h2" | "h3";
}

export function CardHeader({
  title,
  description,
  action,
  icon,
  className,
  as: Heading = "h2",
}: CardHeaderProps) {
  return (
    <header className={cn("flex items-start gap-3 px-4 pt-4 sm:px-5 sm:pt-5", className)}>
      {icon ? (
        <span className="mt-0.5 text-fg-3 [&_svg]:size-5" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <Heading className="font-display text-lg font-semibold tracking-wide text-fg">
          {title}
        </Heading>
        {description ? <p className="mt-0.5 text-sm text-fg-3">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("px-4 py-4 sm:px-5", className)} {...props} />;
}
