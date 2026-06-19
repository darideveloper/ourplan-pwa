import React from "react"
import { Button } from "@/components/atoms/Button"
import { useFormStore } from "@/store/form"
import type { StepPath } from "@/store/form"

interface ContinueButtonProps {
  stepPath: StepPath
  label?: string
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({ stepPath, label = "Continue" }) => {
  const advanceStep = useFormStore((state) => state.advanceStep)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const nextUrl = advanceStep(stepPath)
    if (nextUrl) {
      window.location.href = nextUrl
    }
  }

  return (
    <Button
      onClick={handleClick}
      className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white focus-visible:ring-[#fe676e]"
    >
      {label}
      <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Button>
  )
}
