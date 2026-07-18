import * as React from "react"
import { Label } from "@/components/atoms/Label"
import { Textarea } from "@/components/atoms/Textarea"
import { useField } from "@/store/useField"
import type { FormValues } from "@/store/form"
import { cn } from "@/lib/utils"

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  field: keyof FormValues | string
  label: string
}

export function ValidatedTextarea({ field, label, className, ...props }: ValidatedTextareaProps) {
  const { value, error, setValue, mounted } = useField(field)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
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
        <Textarea
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
