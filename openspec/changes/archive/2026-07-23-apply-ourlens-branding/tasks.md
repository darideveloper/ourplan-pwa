## 1. Theme & Dependencies

- [x] 1.1 Replace `global.css`: add brand/accent/surface colour tokens in `@theme inline`, override shadcn `:root` vars, remove `.dark` block, remove `@custom-variant dark`, switch font to system stack
- [x] 1.2 Remove `@fontsource-variable/inter` from `package.json` dependencies

## 2. Layout Meta Tags

- [x] 2.1 Update `Layout.astro`: change `theme-color` to `#dd4d57`, add `<html style="color-scheme: light;">`
- [x] 2.2 Update `OfflineLayout.astro`: change `theme-color` to `#dd4d57`

## 3. Recolour Components

- [x] 3.1 Recolour `ProgressBar.tsx` — replace `bg-[#fe676e]` with `bg-brand-500`, `text-[#fe676e]` with `text-brand-500`
- [x] 3.2 Recolour `ValidatedInput.tsx` — replace focus ring `#fe676e` with `ring-brand-500/40 border-brand-500`
- [x] 3.3 Recolour `ValidatedTextarea.tsx` — same focus ring replacement
- [x] 3.4 Recolour `ValidatedSelect.tsx` — same focus ring replacement (leave `dark:` classes untouched)
- [x] 3.5 Recolour `ValidatedRadioGroup.tsx` — replace `border-[#fe676e]` with `border-brand-500`, `bg-[#fe676e]/5` with `bg-brand-500/5`, `text-[#fe676e]` with `text-brand-500`
- [x] 3.6 Recolour `CodeInput.tsx` — replace focus ring `#fe676e` with `ring-brand-500/40 border-brand-500`
- [x] 3.7 Recolour `ContinueButton.tsx` — replace `bg-slate-900 hover:bg-slate-800` with gradient brand style, replace `focus-visible:ring-[#fe676e]`
- [x] 3.8 Recolour `VerifyButton.tsx` — same gradient + focus ring replacement
- [x] 3.9 Recolour `LoadingOverlay.tsx` — replace `text-[#fe676e]` with `text-brand-500`

## 4. Recolour Pages

- [x] 4.1 Recolour `index.astro` — replace blob colours `#fe676e/20` and `#fe676e/30` with `brand-500/20` and `brand-500/30`
- [x] 4.2 Recolour `StepLayout.astro` — same blob colour replacements
- [-] 4.3 Recolour `terms.astro` — file deleted in commit beb573f (replaced with external link), task not applicable
