import { create } from "zustand"
import { persist } from "zustand/middleware"
import { z } from "zod"
import { validateCode } from "@/lib/api/validate-code"
import { FetchError } from "@/lib/api/client"
import { INVITE_EXPIRED_MESSAGE } from "@/lib/api/constants"

export const codeInputSchema = z.string().min(1, "Enter your invitation code")

export const termsCheckedSchema = z.boolean().refine((val) => val === true, {
  message: "You must agree to the terms",
})

export const sessionFieldSchemas: Record<string, z.ZodTypeAny> = {
  codeInput: codeInputSchema,
  termsChecked: termsCheckedSchema,
}

export interface SessionState {
  codeInput: string
  termsChecked: boolean
  code: string
  isValid: boolean | null
  isValidating: boolean
  apiError: string | null
  errors: Record<string, string>

  setCodeInput: (value: string) => void
  setTermsChecked: (value: boolean) => void
  validateCodeAction: () => Promise<void>
  reset: () => void
}

const initialState = {
  codeInput: "",
  termsChecked: false,
  code: "",
  isValid: null as boolean | null,
  isValidating: false,
  apiError: null as string | null,
  errors: {} as Record<string, string>,
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCodeInput: (value) => {
        const validation = codeInputSchema.safeParse(value)
        set((state) => ({
          codeInput: value,
          errors: validation.success
            ? Object.fromEntries(Object.entries(state.errors).filter(([k]) => k !== "codeInput"))
            : { ...state.errors, codeInput: validation.error.issues[0]?.message || "Invalid input" },
          apiError: null,
        }))
      },

      setTermsChecked: (value) => {
        const validation = termsCheckedSchema.safeParse(value)
        set((state) => ({
          termsChecked: value,
          errors: validation.success
            ? Object.fromEntries(Object.entries(state.errors).filter(([k]) => k !== "termsChecked"))
            : { ...state.errors, termsChecked: validation.error.issues[0]?.message || "Invalid input" },
        }))
      },

      validateCodeAction: async () => {
        const state = get()

        const codeError = codeInputSchema.safeParse(state.codeInput)
        const termsError = termsCheckedSchema.safeParse(state.termsChecked)

        if (!codeError.success || !termsError.success) {
          const errors: Record<string, string> = {}
          if (!codeError.success) errors.codeInput = codeError.error.issues[0]?.message || "Invalid input"
          if (!termsError.success) errors.termsChecked = termsError.error.issues[0]?.message || "Invalid input"
          set({ errors: { ...state.errors, ...errors } })
          return
        }

        set({ isValidating: true, apiError: null })

        try {
          const response = await validateCode(state.codeInput)

          if (response.valid) {
            set({
              isValid: true,
              isValidating: false,
              code: state.codeInput,
              errors: {},
              apiError: null,
            })
            window.location.href = "/step1"
          } else {
            set({
              isValid: false,
              isValidating: false,
              apiError: INVITE_EXPIRED_MESSAGE,
            })
          }
        } catch (err) {
          const message =
            err instanceof FetchError
              ? err.message
              : "Something went wrong. Please try again."

          set({
            isValid: false,
            isValidating: false,
            apiError: message,
          })
        }
      },

      reset: () =>
        set({
          ...initialState,
        }),
    }),
    {
      name: "ourplan-session",
      partialize: (state) => ({
        code: state.code,
        isValid: state.isValid,
      }),
    }
  )
)

if (typeof window !== "undefined") {
  const state = useSessionStore.getState()
  if (state.isValid === null) {
    useSessionStore.setState({ isValid: false })
  }
}
