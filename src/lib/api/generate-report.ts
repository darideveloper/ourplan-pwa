import { safeFetch } from "./client"
import type { GenerateReportResponse } from "./types"

export function generateReport(data: Record<string, unknown>) {
  const baseUrl = import.meta.env.PUBLIC_N8N_BASE_URL
  return safeFetch<GenerateReportResponse>(`${baseUrl}/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
}
