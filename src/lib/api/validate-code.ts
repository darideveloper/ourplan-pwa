import { safeFetch } from "./client"
import type { ValidateCodeResponse } from "./types"

export function validateCode(code: string) {
  const baseUrl = import.meta.env.PUBLIC_N8N_BASE_URL
  return safeFetch<ValidateCodeResponse>(`${baseUrl}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })
}
