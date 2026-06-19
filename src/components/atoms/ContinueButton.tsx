import React from "react"
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
    <button
      onClick={handleClick}
      className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-2.5 text-sm font-medium text-white shadow hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fe676e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
      <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
