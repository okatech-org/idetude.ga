import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties, forwardRef } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  solid?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, hover = true, solid = false, style, onClick }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          solid ? "glass-card-solid" : "glass-card",
          "rounded-xl",
          hover && "glass-hover",
          onClick && "cursor-pointer",
          className
        )}
        style={style}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
