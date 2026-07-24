import * as React from "react"
import { cn } from "@/lib/utils"

export interface GenerationProgressBarProps {
  progress: number
  message: string
  className?: string
}

export function GenerationProgressBar({ progress, message, className }: GenerationProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1)

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress * 100}%` }}
        />
      </div>
      <p className="text-sm text-slate-500 text-center">{message}</p>
    </div>
  )
}
