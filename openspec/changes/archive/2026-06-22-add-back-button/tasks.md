## 1. Components

- [x] 1.1 Update `src/layouts/StepLayout.astro` Props interface to include optional `backUrl?: string`.
- [x] 1.2 Add Back button UI (styled `<a>` tag using button variants) in `src/layouts/StepLayout.astro`, conditionally rendered if `backUrl` is provided.

## 2. Page Updates

- [x] 2.1 Update `src/pages/step2.astro` to pass `backUrl="/step1"` to `StepLayout`.
- [x] 2.2 Update `src/pages/step3.astro` to pass `backUrl="/step2"` to `StepLayout`.
- [x] 2.3 Update `src/pages/step4.astro` to pass `backUrl="/step3"` to `StepLayout`.
- [x] 2.4 Update `src/pages/summary.astro` (which uses `Layout.astro` directly) to include a Back button linking to `/step4` at the top of its layout.
