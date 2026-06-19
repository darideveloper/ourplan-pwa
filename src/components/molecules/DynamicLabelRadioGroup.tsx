import React from 'react'
import { ValidatedRadioGroup } from '../atoms/ValidatedRadioGroup'
import { useFormStore } from '@/store/form'
import { useShallow } from 'zustand/react/shallow'
import type { FormValues } from '@/store/form'

interface Option {
  value: string
  label: string
  description?: string
}

interface DynamicLabelRadioGroupProps {
  field: keyof FormValues
  options: Option[]
  labelTemplate: string
  labelFields: (keyof FormValues)[]
  fallbackLabel: string
}

export const DynamicLabelRadioGroup: React.FC<DynamicLabelRadioGroupProps> = ({
  field,
  options,
  labelTemplate,
  labelFields,
  fallbackLabel,
}) => {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const fieldValues = useFormStore(
    useShallow((state) => {
      const subset: Record<string, unknown> = {}
      for (const f of labelFields) {
        subset[f as string] = state[f]
      }
      return subset
    })
  )

  const label = React.useMemo(() => {
    if (!mounted) return fallbackLabel

    const allPresent = labelFields.every(
      (f) => fieldValues[f as string] && String(fieldValues[f as string]).trim() !== ''
    )
    if (!allPresent) return fallbackLabel

    let result = labelTemplate
    for (const fieldName of labelFields) {
      result = result.replace(
        new RegExp(`\\{${String(fieldName)}\\}`, 'g'),
        String(fieldValues[fieldName as string])
      )
    }
    return result
  }, [mounted, fieldValues, labelTemplate, labelFields, fallbackLabel])

  return (
    <ValidatedRadioGroup
      field={field}
      label={label}
      options={options}
    />
  )
}
