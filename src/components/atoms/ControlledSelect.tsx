import React, { useId } from "react";
import { Label } from "@/components/atoms/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface ControlledSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  className?: string;
}

export const ControlledSelect: React.FC<ControlledSelectProps> = ({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  error,
  className,
}) => {
  const id = useId();

  return (
    <div className={cn("flex flex-col gap-2 p-2", className)}>
      <Label
        htmlFor={id}
        className={cn("cursor-pointer", error ? "text-red-500" : "")}
      >
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className={cn(
            "w-full bg-white dark:bg-zinc-950 transition-colors rounded-xl border-zinc-200 dark:border-zinc-800",
            error
              ? "border-red-500 focus-visible:ring-red-500"
              : "focus-visible:ring-[#fe676e] focus-visible:border-[#fe676e]"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <span className="text-xs text-red-500 font-medium italic">{error}</span>
      )}
    </div>
  );
};
