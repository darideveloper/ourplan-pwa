import * as React from "react"
import { cn } from "@/lib/utils"
import { FiLoader } from "react-icons/fi"

export interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
}

export function LoadingOverlay({ isVisible, message = "Loading..." }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-300">
        <FiLoader className="h-10 w-10 text-[#fe676e] animate-spin" />
        <p className="text-slate-700 font-medium text-lg">{message}</p>
      </div>
    </div>
  )
}
