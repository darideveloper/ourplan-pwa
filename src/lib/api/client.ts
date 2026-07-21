export class FetchError extends Error {
  constructor(
    public type: "network" | "timeout" | "http" | "parse" | "abort",
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = "FetchError"
  }
}

async function attemptFetch<T>(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<T> {
  const signal = options.signal
    ? AbortSignal.any([options.signal, AbortSignal.timeout(timeoutMs)])
    : AbortSignal.timeout(timeoutMs)

  let response: Response
  try {
    response = await fetch(url, { ...options, signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new FetchError("timeout", "Request timed out")
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new FetchError("abort", "Request was cancelled")
    }
    throw new FetchError("network", err instanceof Error ? err.message : "Network error")
  }

  if (!response.ok) {
    throw new FetchError("http", `HTTP ${response.status} ${response.statusText}`, response.status)
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new FetchError("parse", "Failed to parse response as JSON")
  }

  return data as T
}

export async function safeFetch<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = 30_000,
  maxRetries = 2,
): Promise<T> {
  let lastError: FetchError | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await attemptFetch<T>(url, options, timeoutMs)
    } catch (err) {
      if (!(err instanceof FetchError)) throw err

      lastError = err

      if (err.type === "timeout" || err.type === "network") {
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 5000)
          await new Promise((r) => setTimeout(r, delay))
          continue
        }
      }

      throw err
    }
  }

  throw lastError ?? new FetchError("network", "Unknown error")
}
