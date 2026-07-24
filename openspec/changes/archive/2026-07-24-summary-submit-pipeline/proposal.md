## Why

The summary page currently logs form data to console and shows an alert — it cannot actually submit to n8n for LLM-powered PDF report generation. Users have no way to generate and download their personalised plan. This change wires the final mile: form submission → n8n webhook → progress feedback → PDF download.

## What Changes

- New `generateReport` API function in `src/lib/api/` that POSTs `{ code, data }` payload (invitation code + enriched form data) to `${PUBLIC_N8N_BASE_URL}/report`
- New `GenerationProgressBar` molecule component with fake progress animation (smooth 0→95% over 3 min, snaps to 100% on poll success)
- Rewrite `SummarySubmitButton` as a state machine (idle → generating → complete → error) with:
  - Single-phase progress timer (3 min, cap 95%)
  - Poll loop (every 10s, max 3 min) for checking PDF readiness via HEAD requests
  - Generation counter to guard against stale poll loops across retries
  - Error handling (POST failure + poll timeout), success download button
- Payload restructured: top-level `code` from validated session, `data` containing form fields + `_value_labels`
- Add `buildValueLabels()` to `src/store/form.ts` that produces the `_value_labels` enrichment block from existing Zod enum schemas
- Add `GenerateReportResponse` type to `src/lib/api/types.ts`
- No existing spec requirements change — all new capabilities

## Capabilities

### New Capabilities
- `report-generation`: Frontend flow for submitting plan data to n8n, displaying fake progress feedback, handling success (PDF download) and error (inline message + retry)

### Modified Capabilities
- None

## Impact

- **New file**: `src/lib/api/generate-report.ts` (follows `validate-code.ts` pattern)
- **New file**: `src/components/molecules/GenerationProgressBar.tsx`
- **Modified file**: `src/components/atoms/SummarySubmitButton.tsx` (major rewrite)
- **Modified file**: `src/store/form.ts` (add `buildValueLabels()` function)
- **Modified file**: `src/lib/api/types.ts` (add `GenerateReportResponse`)
- **No new dependencies** — uses existing `safeFetch`, `react-icons/fi` (FiLoader), Zustand
- **No env var changes** — uses existing `PUBLIC_N8N_BASE_URL`
