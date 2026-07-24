import * as React from "react"
import { useSessionStore } from "@/store/session"
import { LoadingOverlay } from "@/components/molecules/LoadingOverlay"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isValid = useSessionStore((state) => state.isValid)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (hydrated && isValid !== true) {
      window.location.replace("/")
    }
  }, [hydrated, isValid])

  if (!hydrated) {
    return (
      <>
        <LoadingOverlay isVisible={true} message="Loading..." />
        {children}
      </>
    )
  }

  if (isValid !== true) {
    return (
      <LoadingOverlay isVisible={true} message="Redirecting..." />
    )
  }

  return <>{children}</>
}
