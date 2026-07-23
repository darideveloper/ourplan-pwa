## 1. Global dark variant override

- [x] 1.1 Add `@custom-variant dark (&:where(.no-dark-mode))` to `src/styles/global.css` after the `@import "tailwindcss"` line

## 2. Strip dark: classes from Step 4 components

- [x] 2.1 Remove `dark:bg-zinc-950 dark:border-zinc-800` from `ValidatedSelect.tsx` SelectTrigger className
- [x] 2.2 Remove `dark:bg-zinc-900/50` from `SupportCircleRepeater.tsx` card container
- [x] 2.3 Remove `dark:text-zinc-100` from `SupportCircleRepeater.tsx` person heading
- [x] 2.4 Remove `dark:hover:bg-red-950/30` from `SupportCircleRepeater.tsx` remove button
- [x] 2.5 Remove `dark:hover:bg-zinc-800` from `SupportCircleRepeater.tsx` add button
- [x] 2.6 Remove `dark:text-zinc-400` from `Step4Form.tsx` intro paragraph

## 3. Update brand-theme spec

- [x] 3.1 Sync the delta spec from `changes/eliminate-dark-mode-styles/specs/brand-theme/spec.md` into `openspec/specs/brand-theme/spec.md`

## 4. Verify the fix

- [x] 4.1 Run `pnpm dev` and test with OS dark mode enabled — Step 4 cards and selects stay light
- [x] 4.2 Run `pnpm build` to confirm no build errors
