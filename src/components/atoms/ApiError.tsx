import * as React from "react"
import { useSessionStore } from "@/store/session"

export function ApiError() {
  const apiError = useSessionStore((state) => state.apiError)

  if (!apiError) return null

  return (
    <p role="alert" className="text-[0.8rem] font-medium text-destructive">
      {apiError}
    </p>
  )
}
