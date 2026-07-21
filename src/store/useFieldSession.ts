import * as React from "react"
import { useSessionStore } from "./session"
import type { SessionState } from "./session"

export function useFieldSession(field: keyof SessionState): {
  value: unknown
  error: string | undefined
  setValue: (v: unknown) => void
  mounted: boolean
} {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const value = useSessionStore((state) => state[field] as unknown)
  const error = useSessionStore((state) => state.errors[field as string])

  const setValue = React.useCallback(
    (v: unknown) => {
      if (field === "codeInput") {
        useSessionStore.getState().setCodeInput(v as string)
      } else if (field === "termsChecked") {
        useSessionStore.getState().setTermsChecked(v as boolean)
      }
    },
    [field]
  )

  let safeValue: unknown
  if (mounted) {
    safeValue = value
  } else {
    if (field === "codeInput") safeValue = ""
    else if (field === "termsChecked") safeValue = false
    else safeValue = null
  }

  return { value: safeValue, error, setValue, mounted }
}
