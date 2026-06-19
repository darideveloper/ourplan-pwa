import React from 'react'
import { Label } from '@/components/atoms/Label'
import { RadioGroup } from '@/components/atoms/RadioGroup'
import { RadioGroupItem } from '@/components/atoms/RadioGroupItem'
import { useField } from '@/store/useField'
import type { FormValues } from '@/store/form'
import { cn } from '@/lib/utils'

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface ValidatedRadioGroupProps {
  field: keyof FormValues;
  label: string;
  options: Option[];
}

export const ValidatedRadioGroup: React.FC<ValidatedRadioGroupProps> = ({ field, label, options }) => {
  const { value, error, setValue, mounted } = useField(field);

  const handleValueChange = (v: string) => {
    setValue(v as FormValues[typeof field]);
  }

  const currentValue = mounted ? (value as string) : undefined;

  const optionIds = React.useMemo(
    () => options.map((o) => `${field}-${o.value}`),
    [field, options]
  )

  return (
    <div className="flex flex-col gap-2 p-2 w-full">
      <Label className={cn(error ? 'text-red-500' : '')}>
        {label}
      </Label>
      <RadioGroup
        value={currentValue ?? ''}
        onValueChange={handleValueChange}
        className="grid grid-cols-1 gap-2 w-full"
      >
        {options.map((option, i) => {
          const id = optionIds[i]
          return (
            <div
              key={option.value}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors w-full",
                currentValue === option.value
                  ? "border-[#fe676e] bg-[#fe676e]/5"
                  : error
                    ? "border-red-200 bg-white hover:border-red-300"
                    : "border-slate-200 bg-white hover:border-[#fe676e]/40"
              )}
            >
              <RadioGroupItem value={option.value} id={id} className="mt-0.5" />
              <Label htmlFor={id} className="flex-1 cursor-pointer text-sm">
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
                    currentValue === option.value ? "text-[#fe676e]" : "text-slate-500"
                  )}>
                    {option.description}
                  </p>
                )}
              </Label>
            </div>
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
