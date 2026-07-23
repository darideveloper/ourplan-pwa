import * as React from "react"
import { useFormStore } from "@/store/form"

export function ResetLink() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (window.confirm("Are you sure? This will clear all your form data.")) {
      useFormStore.getState().reset()
      window.location.href = "/step1"
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
    >
      Start over
    </button>
  )
}
