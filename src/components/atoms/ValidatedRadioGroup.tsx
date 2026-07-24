import * as React from "react"
import { Label } from "@/components/atoms/Label"
import { RadioGroup } from "@/components/atoms/RadioGroup"
import { RadioGroupItem } from "@/components/atoms/RadioGroupItem"
import { useField } from "@/store/useField"
import type { FormValues } from "@/store/form"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
  description?: string
}

interface ValidatedRadioGroupProps {
  field: keyof FormValues | string
  label: string
  options: Option[]
}

export function ValidatedRadioGroup({ field, label, options }: ValidatedRadioGroupProps) {
  const { value, error, setValue, mounted } = useField(field)

  const handleValueChange = (v: string) => {
    setValue(v)
  }

  const currentValue = mounted ? (value as string) : undefined

  const optionIds = React.useMemo(
    () => options.map((o) => `${field}-${o.value}`),
    [field, options]
  )

  return (
    <div className="flex flex-col gap-2 p-2 w-full">
      <Label className={cn(error ? "text-red-500" : "")}>
        {label}
      </Label>
      <RadioGroup
        value={currentValue ?? ""}
        onValueChange={handleValueChange}
        className="grid grid-cols-1 gap-2 w-full"
      >
        {options.map((option, i) => {
          const id = optionIds[i]
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors w-full",
                currentValue === option.value
                  ? "border-brand-500 bg-brand-500/5"
                  : error
                    ? "border-red-200 bg-white hover:border-red-300"
                    : "border-slate-200 bg-white hover:border-brand-500/40"
              )}
            >
              <RadioGroupItem value={option.value} id={id} className="mt-0.5" />
              <div className="flex-1 cursor-pointer text-sm">
                <span
                  className={cn(
                    "font-medium block transition-colors",
                    currentValue === option.value ? "text-slate-900" : "text-slate-700"
                  )}
                >
                  {option.label}
                </span>
                {option.description && (
                  <p className={cn(
                    "mt-1 text-xs transition-colors",
                    currentValue === option.value ? "text-brand-500" : "text-slate-500"
                  )}>
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          )
        })}
      </RadioGroup>
      {error && (
        <span className="text-xs text-red-500 font-medium italic">
          {error}
        </span>
      )}
    </div>
  )
}
