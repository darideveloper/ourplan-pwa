import * as React from "react"
import { useFormStore, getStepIndex, STEP_ORDER } from "@/store/form"
import { cn } from "@/lib/utils"

const STEP_LABELS = ["Step 1", "Step 2", "Step 3", "Step 4"]

export function ProgressBar({ currentPath }: { currentPath?: string }) {
  const currentStep = useFormStore((state) => state.currentStep)
  const stepValidity = useFormStore((state) => state.stepValidity)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const activePath = mounted ? window.location.pathname : (currentPath || "")
  const completedIdx = mounted ? getStepIndex(currentStep) : -1
  const activeIdx = getStepIndex(activePath)
  const currentStepValid = stepValidity[activePath] ?? false

  // Hide on welcome page
  if (activePath === "/") return null

  const steps = STEP_ORDER.filter((s) => s !== "/summary")

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm border-b border-slate-100">
      <nav className="max-w-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {steps.map((path, idx) => {
            const isCompleted = idx <= completedIdx
            const isActive = idx === activeIdx
            const isFuture = idx > completedIdx + 1
            const isForwardFromActive = idx > activeIdx
            const isNavDisabled = isFuture || (isForwardFromActive && !currentStepValid)

            return (
              <div key={path} className="flex items-center">
                <a
                  href={path}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    isNavDisabled ? "cursor-default opacity-40" : ""
                  )}
                  onClick={(e) => {
                    if (isNavDisabled) e.preventDefault()
                  }}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                      isActive
                        ? "bg-[#fe676e] text-white shadow-sm"
                        : isCompleted
                          ? "bg-slate-800 text-white"
                          : "bg-slate-100 text-slate-400"
                    )}
                  >
                    {isCompleted ? (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium hidden sm:inline transition-colors",
                      isActive
                        ? "text-[#fe676e]"
                        : isCompleted
                          ? "text-slate-700"
                          : "text-slate-400"
                    )}
                  >
                    {STEP_LABELS[idx]}
                  </span>
                </a>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-px w-8 sm:w-12 mx-2 transition-colors",
                      idx < completedIdx ? "bg-slate-800" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
