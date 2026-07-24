## 1. Foundation — Types, Labels, and API

- [x] 1.1 Add `GenerateReportResponse { pdfUrl: string }` to `src/lib/api/types.ts`
- [x] 1.2 Add `buildValueLabels()` function to `src/store/form.ts` mapping every Zod enum field to its UK English label, with nested `support_circle` sub-mapping for helper fields
- [x] 1.3 Create `src/lib/api/generate-report.ts` with `generateReport(data)` that POSTs to `${PUBLIC_N8N_BASE_URL}/report` using `safeFetch`, returning `GenerateReportResponse`

## 2. GenerationProgressBar Molecule

- [x] 2.1 Create `src/components/molecules/GenerationProgressBar.tsx` accepting `{ progress: number; message: string }` props
- [x] 2.2 Render outer track container (rounded, grey/light background, full width, fixed height ~12px)
- [x] 2.3 Render inner fill bar with `width: ${progress * 100}%` and `transition: width 500ms ease-out`, coloured with brand gradient
- [x] 2.4 Render message below the bar in muted text, centred

## 3. SummarySubmitButton Rewrite

- [x] 3.1 Define `SubmitState` union type with idle / generating (progress + message) / complete (pdfUrl) / error (message) variants
- [x] 3.2 Implement idle state: render `<Button>` with "Generate My Plan" label, disabled when `disclaimer_agreed` is false
- [x] 3.3 Implement click handler: extract form data via `useFormStore.getState()`, extract session code via `useSessionStore.getState().code`, enrich form data with `buildValueLabels()`, construct payload as `{ code, data: { ... } }`, transition to generating state, increment `generationRef` counter for stale-poll guarding
- [x] 3.4 Implement generating state: render `<GenerationProgressBar>` with progress + message
- [x] 3.5 Implement progress timer: `useEffect` + `setInterval` at 100ms, compute progress via `min(elapsed/180000, 0.95)` single phase, derive stage message from progress range
- [x] 3.6 Implement API call in generating state: `await generateReport(payload)`, on success receive `{ pdfUrl }` and start poll loop, on error clear timer and transition to error
- [x] 3.7 Implement complete state: snap progress to 100% with minimum 2s display, then render `<a>` download button with `href={pdfUrl}` `target="_blank"` styled as primary button "Download Your Plan (PDF)"
- [x] 3.8 Implement error state: render error message in destructive text colour, render "Try Again" `<Button>` that resets to idle
- [x] 3.9 Clean up timer on unmount via `useEffect` return `clearInterval`
- [x] 3.10 Remove unused imports and old `console.log`/`alert` code
- [x] 3.11 Implement poll loop: after POST returns `{ pdfUrl }`, poll `fetch(pdfUrl, { method: "HEAD" })` every 10s, confirm with `generationRef` counter to avoid stale updates, on HTTP 200 transition to complete, on 3-min timeout transition to error
- [x] 3.12 Update `handleTryAgain` to increment `generationRef` counter (cancels any stale poll loop)

## 4. Verify

- [x] 4.1 Run `pnpm build` and fix any TypeScript errors (confirm polling does not introduce new dependencies; `fetch` is native)
- [x] 4.2 Run `pnpm dev` and manually test full flow: navigate to summary, check disclaimer, click Generate, observe progress bar, verify error handling
