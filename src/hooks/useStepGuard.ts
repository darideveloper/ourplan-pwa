import { useEffect } from "react"
import { useFormStore, getStepIndex, getEarliestIncomplete } from "@/store/form"

export function useStepGuard(): void {
  useEffect(() => {
    const currentStep = useFormStore.getState().currentStep
    const targetPath = window.location.pathname

    const targetIdx = getStepIndex(targetPath)
    const completedIdx = getStepIndex(currentStep)

    const isAccessible = targetIdx >= 0 && targetIdx <= completedIdx + 1

    if (!isAccessible) {
      window.location.href = getEarliestIncomplete(currentStep)
    }
  }, [])
}

/** Minimal wrapper for Astro islands. Use with client:load on any step page. */
export const StepGuard = () => {
  useStepGuard()
  return null
}
