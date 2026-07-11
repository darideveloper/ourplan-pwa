import * as React from "react"
import { Label } from "@/components/atoms/Label"
import { Input } from "@/components/atoms/Input"
import { useField } from "@/store/useField"
import type { FormValues } from "@/store/form"
import { cn } from "@/lib/utils"

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  field: keyof FormValues
  label: string
}

export function ValidatedInput({ field, label, className, ...props }: ValidatedInputProps) {
  const { value, error, setValue, mounted } = useField(field)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value as FormValues[typeof field])
  }

  const displayValue = mounted ? (value as string) || "" : ""

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
