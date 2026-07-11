import * as React from "react"
import { useFormStore } from "@/store/form"
import { Button } from "@/components/atoms/Button"
import { cn } from "@/lib/utils"

interface SummarySubmitButtonProps {
  className?: string
}

export function SummarySubmitButton({ className }: SummarySubmitButtonProps) {
  const disclaimerAgreed = useFormStore((state) => state.disclaimer_agreed)

  const handleSubmit = () => {
    const state = useFormStore.getState()
    const {
      errors, currentStep, isNavigating, setIsNavigating, setField, advanceStep, reset,
      ...formValues
    } = state

    console.log("=== FINAL PLAN SUBMISSION ===")
    console.log("Generating plan for:", formValues.parent_name)
    console.log("Form State Data:", JSON.stringify(formValues, null, 2))
    alert("Plan details printed to console!")
  }

  return (
    <Button
      onClick={handleSubmit}
      disabled={!disclaimerAgreed}
      className={cn("w-full py-6 text-lg font-semibold mt-4", className)}
      size="lg"
    >
      Generate My Plan
    </Button>
  )
}
