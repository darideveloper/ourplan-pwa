import * as React from "react"
import { useFieldSession } from "@/store/useFieldSession"
import { Checkbox } from "@/components/atoms/Checkbox"
import { cn } from "@/lib/utils"

interface TermsCheckboxProps {
  className?: string
}

export function TermsCheckbox({ className }: TermsCheckboxProps) {
  const { value, error, setValue } = useFieldSession("termsChecked")

  const handleToggle = (checked: boolean) => {
    setValue(checked)
  }

  return (
    <div className={cn("flex flex-col gap-2 p-2 w-full", className)}>
      <label
        htmlFor="termsChecked"
        className={cn(
          "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm transition-colors cursor-pointer",
          value ? "border-primary bg-primary/5" : "border-input bg-background hover:bg-muted/50",
          error ? "border-destructive" : ""
        )}
      >
        <div className="flex items-center mt-0.5">
          <Checkbox
            checked={!!value}
            onCheckedChange={(checked) => handleToggle(!!checked)}
            id="termsChecked"
          />
        </div>
        <div className="space-y-1 leading-none flex-1">
          <span className="font-medium cursor-pointer leading-relaxed text-sm">
            I agree to the{" "}
            <a
              href="https://ourlivesapp.com/our-plan-terms-and-conditions/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary hover:text-primary/80"
              onClick={(e) => e.stopPropagation()}
            >
              Terms &amp; Conditions
            </a>
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
