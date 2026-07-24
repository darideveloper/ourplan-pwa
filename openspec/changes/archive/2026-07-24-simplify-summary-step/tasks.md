## 1. Remove fields from Zustand store

- [x] 1.1 Remove `email_recipients` and `custom_message` from `summarySchema` in `src/store/form.ts`
- [x] 1.2 Remove `email_recipients` and `custom_message` from `initialState` in `src/store/form.ts`

## 2. Remove UI components from summary page

- [x] 2.1 Remove `ValidatedInput` import from `src/pages/summary.astro`
- [x] 2.2 Remove `ValidatedTextarea` import from `src/pages/summary.astro`
- [x] 2.3 Remove the `<ValidatedInput field="email_recipients" ... />` JSX block
- [x] 2.4 Remove the `<ValidatedTextarea field="custom_message" ... />` JSX block
- [x] 2.5 Remove empty wrapper `<div class="space-y-4">` if it only contained the removed fields

## 3. Verify

- [x] 3.1 Run `pnpm build` — confirm zero TypeScript errors
- [x] 3.2 Run `pnpm dev` — confirm `/summary` loads without email or message fields, disclaimer and submit still work