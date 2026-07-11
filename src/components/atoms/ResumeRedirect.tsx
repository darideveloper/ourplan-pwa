import * as React from "react"
import { useFormStore, getEarliestIncomplete } from "@/store/form"

export function ResumeRedirect() {
  React.useEffect(() => {
    const currentStep = useFormStore.getState().currentStep
    if (currentStep) {
      window.location.href = getEarliestIncomplete(currentStep)
    }
  }, [])

  return null
}
