import * as React from "react"
import { z } from "zod"
import { useFormStore, initialState, getNestedValue, fieldSchemaMap } from "./form"
import type { FormValues } from "./form"

function getDefaultForField(field: string): unknown {
  const leafName = field.includes(".") ? field.split(".").pop()! : field
  const schema = fieldSchemaMap.get(leafName)
  if (!schema) return ""
  if (schema instanceof z.ZodString) return ""
  if (schema instanceof z.ZodEnum) return undefined
  if (schema instanceof z.ZodArray) return []
  return undefined
}

export function useField<K extends keyof FormValues>(field: K): {
  value: FormValues[K] | undefined
  error: string | undefined
  setValue: (v: FormValues[K]) => void
  mounted: boolean
}
export function useField(field: string): {
  value: unknown
  error: string | undefined
  setValue: (v: unknown) => void
  mounted: boolean
}
export function useField(field: string) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isDotted = field.includes(".")
  const setField = useFormStore((state) => state.setField)

  const value = useFormStore((state) =>
    isDotted ? getNestedValue(state as Record<string, unknown>, field) : state[field as keyof typeof state]
  )
  const error = useFormStore((state) => state.errors[field])

  const setValue = React.useCallback(
    (v: unknown) => {
      setField(field, v)
    },
    [field, setField]
  )

  let safeValue: unknown
  if (mounted) {
    safeValue = value
  } else if (isDotted) {
    const fallback = getNestedValue(initialState as Record<string, unknown>, field)
    safeValue = fallback !== undefined ? fallback : getDefaultForField(field)
  } else {
    safeValue = initialState[field as keyof typeof initialState]
  }

  return { value: safeValue, error, setValue, mounted }
}
