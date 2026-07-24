## Why

The `/report` n8n webhook response includes a `valid` field that can be `false` when the user's invitation code has expired during the form session. Currently the frontend ignores this field and proceeds to poll the `pdfUrl` indefinitely, leaving the user stuck on a "generating" spinner with no feedback that their session is invalid. The user needs a clear error and a path to recover (get a new invitation code).

## What Changes

- **`src/lib/api/types.ts`** — Add `valid?: boolean` to `GenerateReportResponse` type
- **`src/components/atoms/SummarySubmitButton.tsx`** — Add submit state machine:
  - Check `response.valid === false` after `/report` POST
  - Render a modal overlay with the expired-code error message
  - Provide a "Enter New Invitation Code" button that resets both stores and navigates to `/`
- **Landing page error message** — Reuse the exact error string from `/` page: "That invitation code is not recognised or has expired. Please check and try again."

## Capabilities

### New Capabilities
- `expired-invite-handling`: Detect expired invitation codes from the `/report` webhook response and present a clear recovery path (modal + navigation to landing page)

### Modified Capabilities
- None — this is a new concern, not a change to existing requirements

## Impact

- **3 files modified**: `src/lib/api/types.ts`, `src/components/atoms/SummarySubmitButton.tsx`, `src/store/session.ts`
- **1 new file**: `src/lib/api/constants.ts` — shared error string constant
- **No new components or dependencies** — overlay uses `createPortal` to `document.body` (bypasses `backdrop-blur` containing block on card wrapper), constants file is a single export
- **No backend changes** — n8n already sends the `valid` field; this is purely a frontend consumption fix
- **No new dependencies** — uses existing `Button` atom and `react-dom` (already installed)
