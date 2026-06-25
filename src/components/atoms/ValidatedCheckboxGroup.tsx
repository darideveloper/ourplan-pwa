import * as React from "react"
import { useFormStore, type FormValues } from "@/store/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
}

interface ValidatedCheckboxGroupProps {
  field: keyof FormValues
  label?: string
  options: Option[]
  className?: string
}

export function ValidatedCheckboxGroup({ field, label, options, className }: ValidatedCheckboxGroupProps) {
  const value = useFormStore((state) => state[field]) as string[] | undefined
  const error = useFormStore((state) => state.errors[field])
  const setField = useFormStore((state) => state.setField)
  const parentName = useFormStore((state) => state.parent_name)

  const currentValues = value || []
  
  const displayLabel = React.useMemo(() => {
    if (!label) return null
    const nameToUse = parentName || "your loved one"
    return label.replace(/\[Name\]|\[Parent Name\]/gi, nameToUse)
  }, [label, parentName])

  const handleToggle = (optionValue: string, checked: boolean) => {
    let nextValues: string[]
    if (checked) {
      nextValues = [...currentValues, optionValue]
    } else {
      nextValues = currentValues.filter((v) => v !== optionValue)
    }
    setField(field, nextValues)
  }

  return (
    <div className={cn("flex flex-col gap-2 p-2 w-full", className)}>
      {displayLabel && (
        <Label className={cn("mb-2 cursor-auto", error ? "text-destructive" : "")}>
          {displayLabel}
        </Label>
      )}
      <div className="space-y-3">
      {options.map((opt) => {
        const isChecked = currentValues.includes(opt.value)
        
        return (
          <label
            key={opt.value}
            htmlFor={`${field}-${opt.value}`}
            className={cn(
              "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm transition-colors cursor-pointer",
              isChecked ? "border-primary bg-primary/5" : "border-input bg-background hover:bg-muted/50"
            )}
          >
            <div className="flex items-center mt-0.5">
              <Checkbox 
                checked={isChecked} 
                onCheckedChange={(checked) => handleToggle(opt.value, !!checked)} 
                id={`${field}-${opt.value}`}
              />
            </div>
            <div className="space-y-1 leading-none flex-1">
              <span className="font-medium cursor-pointer">
                {opt.label}
              </span>
            </div>
          </label>
        )
      })}
      </div>
      
      {error && (
        <p className="text-[0.8rem] font-medium text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
