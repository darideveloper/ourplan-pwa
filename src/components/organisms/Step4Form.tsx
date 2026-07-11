import * as React from "react"
import { SupportCircleRepeater } from "@/components/molecules/SupportCircleRepeater"

export function Step4Form() {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      <div className="space-y-4">
        <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
          Tell us about anyone else in your support circle who can help out when the time comes (siblings, partners, extended family, or helpful neighbours).
        </p>
      </div>

      <SupportCircleRepeater />
    </div>
  )
}
