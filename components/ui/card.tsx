import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };
