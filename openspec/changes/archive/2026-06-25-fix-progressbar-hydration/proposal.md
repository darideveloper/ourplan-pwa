## Why

Currently, the `ProgressBar` component in the form layout is entirely hidden during Server-Side Rendering (SSR) because it relies on `window.location.pathname` and wait for the component to mount. This causes the progress bar to pop into the DOM after React hydrates, pushing the entire form body down and creating an ugly visual layout shift (glitch) on every page load.

## What Changes

- Modify `src/layouts/Layout.astro` to pass the server-known `Astro.url.pathname` as a prop (`currentPath`) to the `ProgressBar`.
- Modify `src/components/atoms/ProgressBar.tsx` to accept this `currentPath` prop.
- Render the `ProgressBar`'s structural shell and active state using the `currentPath` during SSR.
- Defer the "completed" state (checkmarks and dark lines) to client-side hydration, preventing hydration mismatch errors while still maintaining a stable layout block.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None (This is purely a bug fix / performance / UI polish task)

## Impact

- `src/layouts/Layout.astro`
- `src/components/atoms/ProgressBar.tsx`
