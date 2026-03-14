import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          // Variants
          variant === "primary" &&
          "bg-orange text-white hover:bg-orange-hover active:scale-[0.98] rounded-lg",
          variant === "secondary" &&
          "border border-white/20 text-white hover:border-white/40 hover:bg-white/5 rounded-lg",
          variant === "ghost" &&
          "text-orange hover:text-orange-hover",
          // Sizes
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-base",
          size === "lg" && "px-8 py-4 text-lg",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
