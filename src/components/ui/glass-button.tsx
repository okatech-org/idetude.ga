import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { Link } from "react-router-dom";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ children, variant = "primary", size = "md", href, className, ...props }, ref) => {
    const baseStyles = "glass-button rounded-lg font-medium inline-flex items-center justify-center gap-2";
    
    const variants = {
      primary: "glass-button-primary",
      outline: "glass-button-outline",
      ghost: "bg-transparent hover:bg-primary/5 text-foreground",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    const combinedClassName = cn(baseStyles, variants[variant], sizes[size], className);

    if (href) {
      return (
        <Link to={href} className={combinedClassName}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";
