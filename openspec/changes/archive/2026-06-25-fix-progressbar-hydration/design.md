## Context

The `ProgressBar` currently returns `null` on the server because `window` is not defined and the component waits for hydration (`mounted` state) to read `window.location.pathname`. This means the layout space is collapsed during the initial render and expands suddenly when hydration finishes, causing a visual jolt.

## Goals / Non-Goals

**Goals:**
- Render the structural layout of the `ProgressBar` during SSR.
- Correctly highlight the *current active step* during SSR.
- Avoid React hydration mismatch errors.
- Ensure the user's completed steps (from `localStorage`) are gracefully loaded without layout shift.

**Non-Goals:**
- We are not changing the design or CSS classes of the progress bar.
- We are not fixing state persistence itself (it already works).

## Decisions

1. **Pass `currentPath` from Astro:** Since Astro routing determines the path on the server, we will grab `Astro.url.pathname` in `Layout.astro` and pass it to `ProgressBar` as a prop.
2. **Hydration-Safe Completed State:** To prevent React hydration mismatches, we will use the `mounted` state purely for the *completed* state calculation.
   - During SSR and the very first client render, `isCompleted` will evaluate to `false` (via `completedIdx = -1`), so the DOM matches perfectly.
   - After hydration (when `useEffect` sets `mounted = true`), it will use the actual `completedIdx` from Zustand, immediately updating the visual checkmarks.
3. **Active State on Server:** `activeIdx` will be calculated synchronously using the passed `currentPath`, allowing the correct step to be highlighted on the initial server HTML.

## Risks / Trade-offs

- **Risk:** Minor visual delay for the checkmarks to appear on completed steps.
  - **Mitigation:** The layout shift is completely solved. Checkmarks popping in is a color/icon swap rather than a structural layout shift, which is significantly less distracting and a standard practice for hydration logic with persisted local state.
