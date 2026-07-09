import * as React from "react"
import { useFormStore, type FormValues } from "@/store/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface DisclaimerCheckboxProps {
  className?: string
}

export function DisclaimerCheckbox({ className }: DisclaimerCheckboxProps) {
  const field: keyof FormValues = "disclaimer_agreed"
  const value = useFormStore((state) => state[field]) as boolean
  const error = useFormStore((state) => state.errors[field])
  const setField = useFormStore((state) => state.setField)

  const handleToggle = (checked: boolean) => {
    setField(field, checked)
  }

  return (
    <div className={cn("flex flex-col gap-2 p-2 w-full", className)}>
      <label
        htmlFor={field}
        className={cn(
          "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm transition-colors cursor-pointer",
          value ? "border-primary bg-primary/5" : "border-input bg-background hover:bg-muted/50",
          error ? "border-destructive" : ""
        )}
      >
        <div className="flex items-center mt-0.5">
          <Checkbox 
            checked={value} 
            onCheckedChange={(checked) => handleToggle(!!checked)} 
            id={field}
          />
        </div>
        <div className="space-y-1 leading-none flex-1">
          <span className="font-medium cursor-pointer leading-relaxed text-sm">
            I understand that this plan is for informational purposes only and does not replace professional legal, financial, or medical advice. I agree to the Terms & Disclaimer.
          </span>
        </div>
      </label>
      
      {error && (
        <p className="text-[0.8rem] font-medium text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
