import * as React from "react"
import { Label } from "@/components/atoms/Label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select"
import { useField } from "@/store/useField"
import type { FormValues } from "@/store/form"
import { cn } from "@/lib/utils"

interface Option {
  label: string
  value: string
}

interface ValidatedSelectProps {
  field: keyof FormValues | string
  label: string
  options: Option[]
  placeholder?: string
}

export function ValidatedSelect({ field, label, options, placeholder = "Select an option" }: ValidatedSelectProps) {
  const { value, error, setValue, mounted } = useField(field)

  const currentValue = mounted ? (value as string) || "" : ""

  const handleValueChange = (v: string) => {
    setValue(v)
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <Label className={cn(error ? "text-red-500" : "")}>
        {label}
      </Label>
      <Select value={currentValue} onValueChange={handleValueChange}>
        <SelectTrigger
          className={cn(
            "w-full bg-white dark:bg-zinc-950 transition-colors rounded-xl border-zinc-200 dark:border-zinc-800",
            error
              ? "border-red-500 focus-visible:ring-red-500"
              : "focus-visible:ring-brand-500/40 focus-visible:border-brand-500"
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
  )
}
