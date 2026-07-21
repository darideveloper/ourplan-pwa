## Why

The `hazard_flags` checkbox group on Step 3 loses its selected values every time the user navigates away and back, because a `useEffect` in `Step3Form.tsx` clears the array on every component mount instead of only when `ourlens_completed` actually changes between branches. Other form fields remember their state correctly.

## What Changes

- Replace the bare `useEffect` reset in `Step3Form.tsx` with a ref-guarded effect that only clears `hazard_flags` when `ourlens_completed` transitions between values
- Update the `form-screens` spec to require this precise behaviour (clear on value change, not on mount)

## Capabilities

### New Capabilities
*(none)*

### Modified Capabilities
- `form-screens`: The existing requirement for clearing `hazard_flags` on `ourlens_completed` toggle SHALL use a ref-based guard so the clear only fires on actual value transitions, not on component remount

## Impact

- `src/components/organisms/Step3Form.tsx` — one `useRef` added, effect body wrapped in a guard
- `openspec/specs/form-screens/spec.md` — update to specify the ref-guard approach
