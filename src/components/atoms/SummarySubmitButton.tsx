import * as React from "react"
import { useFormStore, buildValueLabels } from "@/store/form"
import { useSessionStore } from "@/store/session"
import { generateReport } from "@/lib/api/generate-report"
import { FetchError } from "@/lib/api/client"
import { GenerationProgressBar } from "@/components/molecules/GenerationProgressBar"
import { Button } from "@/components/atoms/Button"
import { cn } from "@/lib/utils"

interface SummarySubmitButtonProps {
  className?: string
}

type SubmitState =
  | { status: "idle" }
  | { status: "generating"; progress: number; message: string }
  | { status: "complete"; pdfUrl: string }
  | { status: "error"; message: string }

const MAX_POLL_MS = 180000
const POLL_INTERVAL = 10000
const PROGRESS_CAP = 0.95

function getStageMessage(progress: number): string {
  if (progress >= 1) return "Your plan is ready!"
  if (progress >= 0.95) return "Just a bit more... almost there"
  if (progress >= 0.90) return "Still working... this is taking longer than usual"
  if (progress >= 0.80) return "Finalising your report..."
  if (progress >= 0.60) return "Checking home safety recommendations..."
  if (progress >= 0.30) return "Reviewing your support network..."
  if (progress >= 0.08) return "Building your personalised plan..."
  return "Analysing your responses..."
}

export function SummarySubmitButton({ className }: SummarySubmitButtonProps) {
  const disclaimerAgreed = useFormStore((state) => state.disclaimer_agreed)
  const [submitState, setSubmitState] = React.useState<SubmitState>({ status: "idle" })
  const [showButton, setShowButton] = React.useState(false)

  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = React.useRef<number>(0)
  const holdTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const generationRef = React.useRef(0)

  const clearTimers = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }, [])

  React.useEffect(() => {
    return clearTimers
  }, [clearTimers])

  React.useEffect(() => {
    if (submitState.status !== "generating") return

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const progress = Math.min(elapsed / MAX_POLL_MS, PROGRESS_CAP)

      setSubmitState((prev) => {
        if (prev.status !== "generating") return prev
        return { status: "generating", progress, message: getStageMessage(progress) }
      })
    }, 100)

    return () => {
      clearInterval(timerRef.current!)
      timerRef.current = null
    }
  }, [submitState.status])

  const handleGenerate = () => {
    setShowButton(false)
    setSubmitState({ status: "generating", progress: 0, message: "Analysing your responses..." })

    generationRef.current += 1
    const gen = generationRef.current

    const formState = useFormStore.getState()
    const {
      errors, currentStep, stepValidity, isNavigating,
      setIsNavigating, setField, advanceStep, reset,
      ...formValues
    } = formState

    const sessionCode = useSessionStore.getState().code
    const payload = { code: sessionCode, data: { ...formValues, _value_labels: buildValueLabels(formValues) } }
    startTimeRef.current = Date.now()

    generateReport(payload)
      .then((response) => {
        const { pdfUrl } = response
        const pollStart = Date.now()

        const poll = async () => {
          while (generationRef.current === gen && Date.now() - pollStart < MAX_POLL_MS) {
            try {
              const res = await fetch(pdfUrl, { method: "HEAD" })
              if (res.ok) {
                if (generationRef.current !== gen) return
                clearTimers()
                setSubmitState({ status: "complete", pdfUrl })
                holdTimerRef.current = setTimeout(() => setShowButton(true), 2000)
                return
              }
            } catch {
              // Network or timeout error — keep polling
            }
            await new Promise((r) => setTimeout(r, POLL_INTERVAL))
          }

          if (generationRef.current !== gen) return
          clearTimers()
          setSubmitState({
            status: "error",
            message: "PDF generation timed out. Please try again.",
          })
        }

        poll()
      })
      .catch((err: unknown) => {
        clearTimers()
        const message = err instanceof FetchError
          ? err.message
          : "Something went wrong. Please try again."
        setSubmitState({ status: "error", message })
      })
  }

  const handleTryAgain = () => {
    generationRef.current += 1
    clearTimers()
    setShowButton(false)
    setSubmitState({ status: "idle" })
  }

  if (submitState.status === "complete" && showButton) {
    return (
      <a
        href={submitState.pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center justify-center w-full py-6 text-lg font-semibold mt-4 rounded-md",
          "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700",
          "text-white focus-visible:ring-brand-500/40 outline-none",
          className
        )}
      >
        Download Your Plan (PDF)
      </a>
    )
  }

  if (submitState.status === "complete") {
    return (
      <GenerationProgressBar progress={1} message="Your plan is ready!" className="mt-4" />
    )
  }

  if (submitState.status === "generating") {
    return (
      <GenerationProgressBar
        progress={submitState.progress}
        message={submitState.message}
        className="mt-4"
      />
    )
  }

  if (submitState.status === "error") {
    return (
      <div className={cn("mt-4 space-y-4", className)}>
        <p role="alert" className="text-sm font-medium text-destructive">
          {submitState.message}
        </p>
        <Button
          onClick={handleTryAgain}
          className="w-full py-6 text-lg font-semibold"
          size="lg"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <Button
      onClick={handleGenerate}
      disabled={!disclaimerAgreed}
      className={cn("w-full py-6 text-lg font-semibold mt-4", className)}
      size="lg"
    >
      Generate My Plan
    </Button>
  )
}
