## 1. Types and Constants

- [x] 1.1 Add `valid?: boolean` to `GenerateReportResponse` in `src/lib/api/types.ts`
- [x] 1.2 Extract shared error string to `src/lib/api/constants.ts` — create file with `INVITE_EXPIRED_MESSAGE` constant

## 2. SummarySubmitButton — State Machine

- [x] 2.1 Add `{ status: "expired" }` variant to `SubmitState` union type
- [x] 2.2 In `handleGenerate`, check `response.valid === false` after POST — transition to expired state, skip polling
- [x] 2.3 Render expired overlay when `submitState.status === "expired"` — fixed overlay with error message + "Request New Invitation Code" button
- [x] 2.4 Implement `handleRequestNewCode` — reset form store, reset session store, navigate to `/`

## 3. Landing Page — Reuse Constant

- [x] 3.1 Update `src/store/session.ts` to import `INVITE_EXPIRED_MESSAGE` from `@/lib/api/constants` instead of the hardcoded string
