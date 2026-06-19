import React from 'react'
import { Label } from '@/components/ui/label'
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value as FormValues[typeof field]);
  }

  const currentValue = mounted ? (value as string) : undefined;

  return (
    <div className="flex flex-col gap-2 p-2 w-full">
      <Label className={cn(error ? 'text-red-500' : '')}>
        {label}
      </Label>
      <div className="grid grid-cols-1 gap-2 w-full">
        {options.map((option) => {
          const isSelected = currentValue === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "group relative flex text-left cursor-pointer rounded-lg border p-3 transition-colors outline-none w-full",
                isSelected
                  ? "border-[#fe676e] bg-[#fe676e]/5"
                  : error
                    ? "border-red-200 bg-white hover:border-red-300"
                    : "border-slate-200 bg-white hover:border-[#fe676e]/40"
              )}
            >
              <input
                type="radio"
                name={field}
                value={option.value}
                checked={isSelected}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <span
                      className={cn(
                        "font-medium cursor-pointer transition-colors block",
                        isSelected ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                      )}
                    >
                      {option.label}
                    </span>
                    {option.description && (
                      <p className={cn(
                        "mt-1 text-xs transition-colors",
                        isSelected ? "text-[#fe676e]" : "text-slate-500"
                      )}>
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ml-3",
                  isSelected
                    ? "border-[#fe676e] bg-[#fe676e]"
                    : "border-slate-300 bg-white group-hover:border-[#fe676e]/60"
                )}>
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full bg-white transition-all",
                    isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  )} />
                </div>
              </div>
            </label>
          )
        })}
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium italic">
          {error}
        </span>
      )}
    </div>
  )
}
