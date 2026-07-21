import { useEffect } from "react"
import { useFormStore, getStepIndex, getEarliestIncomplete } from "@/store/form"

/** Minimal wrapper for Astro islands. Use with client:load on any step page.
 *  Defers the access check to the next macrotask so Zustand persist
 *  rehydration completes first — prevents false redirects on fresh page loads
 *  when currentStep is still the initial empty string. */
export const StepGuard = () => {
  const currentStep = useFormStore((state) => state.currentStep)

  useEffect(() => {
    const id = setTimeout(() => {
      const targetPath = window.location.pathname
      const targetIdx = getStepIndex(targetPath)
      const completedIdx = getStepIndex(currentStep)

      const isAccessible = targetIdx >= 0 && targetIdx <= completedIdx + 1

      if (!isAccessible) {
        window.location.href = getEarliestIncomplete(currentStep)
      }
    }, 0)
    return () => clearTimeout(id)
  }, [currentStep])

  return null
}
