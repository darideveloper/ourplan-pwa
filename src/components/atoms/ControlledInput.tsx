import * as React from "react"
import { useId } from "react"
import { Label } from "@/components/atoms/Label"
import { Input } from "@/components/atoms/Input"
import { cn } from "@/lib/utils"

interface ControlledInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
}

export function ControlledInput({ label, value, onChange, error, className, ...props }: ControlledInputProps) {
  const id = useId()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <Label
        htmlFor={id}
        className={cn("cursor-pointer", error ? "text-red-500" : "")}
      >
        {label}
      </Label>
      <div className="relative w-full">
        <Input
          id={id}
          value={value}
          onChange={handleChange}
          className={cn(
            "w-full transition-colors",
            error
              ? "border-red-500 focus-visible:ring-red-500"
              : "focus-visible:ring-[#fe676e] focus-visible:border-[#fe676e]",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium italic">{error}</span>
      )}
    </div>
  )
}
