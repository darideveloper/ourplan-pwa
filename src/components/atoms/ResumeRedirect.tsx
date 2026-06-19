import { useEffect } from "react"
import { useFormStore, getEarliestIncomplete } from "@/store/form"

export const ResumeRedirect = () => {
  useEffect(() => {
    const currentStep = useFormStore.getState().currentStep
    if (currentStep) {
      window.location.href = getEarliestIncomplete(currentStep)
    }
  }, [])

  return null
}
