import * as React from "react"
import { z } from "zod"
import { Button } from "@/components/atoms/Button"
import { useFormStore, stepSchemas } from "@/store/form"
import type { StepPath } from "@/store/form"

interface ContinueButtonProps {
  stepPath: StepPath
  label?: string
}

export function ContinueButton({ stepPath, label = "Continue" }: ContinueButtonProps) {
  const advanceStep = useFormStore((state) => state.advanceStep)
  const setIsNavigating = useFormStore((state) => state.setIsNavigating)
  const isValid = useFormStore((state) => state.stepValidity[stepPath] ?? false)

  React.useEffect(() => {
    const state = useFormStore.getState()
    if (state.stepValidity[stepPath] !== undefined) return
    const schema = stepSchemas[stepPath]
    if (!schema) return
    const data: Record<string, unknown> = {}
    const shape = schema.shape as Record<string, z.ZodTypeAny>
    for (const key of Object.keys(shape)) {
      data[key] = state[key as keyof typeof state]
    }
    useFormStore.setState({
      stepValidity: { ...state.stepValidity, [stepPath]: schema.safeParse(data).success }
    })
  }, [stepPath])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const nextUrl = advanceStep(stepPath)
    if (nextUrl) {
      setIsNavigating(true)
      window.location.href = nextUrl
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={!isValid}
      className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white focus-visible:ring-[#fe676e]"
    >
      {label}
      <svg
        className="ml-2 h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Button>
  )
}
