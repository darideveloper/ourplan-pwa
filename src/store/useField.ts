import * as React from "react"
import { useFormStore, initialState } from "./form"
import type { FormValues } from "./form"

/**
 * useField — the single store-binding contract for validated atoms.
 *
 * Each validated atom (ValidatedInput, ValidatedRadioGroup, and future atoms)
 * calls `useField(field)` to obtain its state. The hook owns the hydration
 * safety gate so atoms don't re-implement it.
 *
 * ## Hydration contract
 *
 * `mounted` starts `false` and flips to `true` after the first client-side
 * effect runs. Before mount, `value` returns the field's initial/empty value
 * (from `initialState` in form.ts) so that server-rendered HTML and the first
 * client render match exactly. Atoms MUST consume `value` from this hook (not
 * from `useFormStore` directly) to avoid hydration mismatches.
 */
export function useField<K extends keyof FormValues>(field: K) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const value = useFormStore((state) => state[field])
  const error = useFormStore((state) => state.errors[field as string])
  const setField = useFormStore((state) => state.setField)

  const setValue = React.useCallback(
    (v: FormValues[K]) => {
      setField(field, v as FormValues[K])
    },
    [field, setField]
  )

  const safeValue: FormValues[K] = mounted
    ? (value as FormValues[K])
    : (initialState[field] as FormValues[K])

  return { value: safeValue, error, setValue, mounted }
}
