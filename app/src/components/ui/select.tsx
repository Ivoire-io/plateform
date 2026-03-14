"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type React from "react";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

// ─── Native-select based implementation (simple, performant) ───

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: ReactNode;
}

interface SelectContextValue {
  value: string;
  onValueChange: (v: string) => void;
}

const SelectContext = createContext<SelectContextValue>({ value: "", onValueChange: () => { } });

function Select({ value, onValueChange, defaultValue = "", children }: SelectProps) {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;

  function handle(v: string) {
    if (!controlled) setInternal(v);
    onValueChange?.(v);
  }

  return (
    <SelectContext.Provider value={{ value: current, onValueChange: handle }}>
      {children}
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps {
  className?: string;
  children?: ReactNode;
  placeholder?: string;
}

function SelectTrigger({ className, children }: SelectTriggerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground cursor-default",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
    </div>
  );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useContext(SelectContext);
  return <span>{value || <span className="text-muted-foreground">{placeholder}</span>}</span>;
}

// Compatibility stubs — not actually rendered, NativeSelect is used instead
const SelectContent: React.FC<{ children?: ReactNode }> = () => null;
const SelectItem: React.FC<{ value: string; children?: ReactNode }> = () => null;

// ─── Actual working select using native HTML select ───

interface NativeSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: ReactNode;
}

function NativeSelect({ value, onValueChange, className, children, ...props }: NativeSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          "w-full appearance-none bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground cursor-default pr-8 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  );
}

function NativeSelectOption({ value, children }: { value: string; children: ReactNode }) {
  return <option value={value}>{children}</option>;
}

export {
  NativeSelect,
  NativeSelectOption, Select, SelectContent,
  SelectItem, SelectTrigger,
  SelectValue
};

