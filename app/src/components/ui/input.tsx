import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full bg-surface border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
