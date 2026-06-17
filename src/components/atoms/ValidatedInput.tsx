import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFormStore } from "@/store/form";
import type { FirstStepState } from "@/store/form";
import { cn } from "@/lib/utils";

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  field: keyof FirstStepState;
  label: string;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  field,
  label,
  className,
  ...props
}) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const value = useFormStore((state) => state[field] as string);
  const error = useFormStore((state) => state.errors[field]);
  const setField = useFormStore((state) => state.setField);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This triggers the Zod validation inside the store
    setField(field, e.target.value);
  };

  const displayValue = mounted ? value || "" : "";

  return (
    <div className="flex flex-col gap-2 p-2">
      <Label
        htmlFor={field}
        className={cn("cursor-pointer", error ? "text-red-500" : "")}
      >
        {label}
      </Label>
      <div className="relative w-full">
        <Input
          id={field}
          value={displayValue}
          onChange={handleChange}
          className={cn(
            "w-full transition-colors",
            error
              ? "border-red-500 focus-visible:ring-red-500"
              : "focus-visible:ring-[#fe676e] focus-visible:border-[#fe676e]",
            className,
          )}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium italic">{error}</span>
      )}
    </div>
  );
};
