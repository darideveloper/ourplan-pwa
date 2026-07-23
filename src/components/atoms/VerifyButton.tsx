import * as React from "react"
import { useSessionStore } from "@/store/session"
import { Button } from "@/components/atoms/Button"
import { FiLoader } from "react-icons/fi"

export function VerifyButton() {
  const isValidating = useSessionStore((state) => state.isValidating)
  const errors = useSessionStore((state) => state.errors)

  const hasFieldErrors = errors.codeInput !== undefined || errors.termsChecked !== undefined
  const isDisabled = isValidating || hasFieldErrors

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    useSessionStore.getState().validateCodeAction()
  }

  return (
    <div className="p-2 w-full">
      <Button
        onClick={handleClick}
        disabled={isDisabled}
        className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white focus-visible:ring-brand-500/40"
      >
        {isValidating ? (
          <>
            <FiLoader className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify Code"
        )}
      </Button>
    </div>
  )
}
