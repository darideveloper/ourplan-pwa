## Why

The `ControlledInput` and `ControlledSelect` components are props-driven wrappers that duplicate ~80% of the rendering logic from their `Validated*` counterparts. They exist solely because `useField()` can only bind to top-level store keys, forcing `SupportCircleRepeater` to manage array sub-fields via manual props. This creates two parallel architectural patterns for the same task — one store-driven, one props-driven — and blocks inline validation on array items.

## What Changes

- **Add dotted-path support** to `useField()` and the Zustand store's `setField()` so that nested fields like `support_circle.0.helper_name` can be read/written with full validation
- **Add `flattenNestedSchemas()`** utility that indexes nested Zod schemas (from `z.array()` item schemas) into `fieldSchemaMap` — enables per-field validation for array items; `fieldSchemaMap` type widens from `Map<keyof FormValues, ...>` to `Map<string, ...>`
- **Add `Select.tsx`** presentation wrapper in atoms (mirrors existing `Checkbox.tsx` pattern)
- **Add `ValidatedSelect.tsx`** atom — store-binding select component (missing counterpart to `ControlledSelect`)
- **Delete `ControlledInput.tsx`** and **`ControlledSelect.tsx`** — no longer needed
- **Rewrite `SupportCircleRepeater.tsx`** to use `ValidatedInput` + `ValidatedSelect` with dotted paths; stable IDs computed from existing data (not module-level counter) to avoid collision on page reload; React keys use `person._id ?? idx` fallback for type-soundness
- **Fix `ValidatedRadioGroup.tsx`** to use `useField("parent_name")` instead of raw `useFormStore` for the dynamic label (consistency)
- **Fix pre-existing `advanceStep` nested error leak** — successful validation now clears nested error keys (e.g. `support_circle.0.helper_name`)
- **Add `_id: z.number().optional()` to `personSchema`** — type-sound storage for stable React keys
- **Widen `ValidatedInputProps.field`**, `ValidatedRadioGroupProps.field`, and `DynamicLabelRadioGroupProps.field`** from `keyof FormValues` to `keyof FormValues | string` to accept dotted paths
- **Update `setField` store interface** type to accept `string` field for dotted-path calls
- **Add `useField()` TypeScript overload** — preserves strict type safety for top-level fields, accepts `string` for dotted paths
- **Fix hydration safety in `useField()`** — safe-navigation fallback prevents crashes when parent array is empty (e.g. `support_circle.0.helper_name` before any person is added)
- **Update `shadcn-atom-wrappers` spec** to include `Select` and `Checkbox` in the required wrapper list
- **Update `component-standardisation` spec** to reflect unified `Validated*`-only architecture

## Capabilities

### New Capabilities

- `nested-store-paths`: Support for dotted-path field access in `useField()` and the Zustand store, enabling the `Validated*` pattern for array-of-objects data structures
- `validated-select`: A `ValidatedSelect` atom that binds a shadcn `Select` to the Zustand store via `useField()`, mirroring `ValidatedInput`
- `select-wrapper`: The missing `Select.tsx` presentation wrapper in `src/components/atoms/` that re-exports shadcn `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`

### Modified Capabilities

- `component-standardisation`: Add requirement that `Validated*` is the only pattern — no `Controlled*` components, no props-driven field state
- `shadcn-atom-wrappers`: Add `Checkbox.tsx` and `Select.tsx` wrappers to the required set; update grep rule to match new reality

## Impact

- **src/store/useField.ts**: Accept dotted-path strings via overloaded type; parse nested reads/writes; safe-navigation fallback for empty parent arrays
- **src/store/form.ts**: `setField` handles dotted paths (parent-key + leaf-field extraction, `setNestedValue` writes); `flattenNestedSchemas()` indexes nested Zod schemas into `fieldSchemaMap` (map type widened to `Map<string, ...>`, `as keyof FormValues` cast removed); `advanceStep` clears nested error keys on successful validation; `setField` type widened to accept `string`; `_id` added to `personSchema`
- **src/components/atoms/**: Remove `ControlledInput.tsx`, `ControlledSelect.tsx`; add `Select.tsx`, `ValidatedSelect.tsx`
- **src/components/molecules/SupportCircleRepeater.tsx**: Rewrite to use `ValidatedInput`/`ValidatedSelect` with dotted paths; replace fragile `helper_name + idx` keys with stable IDs
- **src/components/atoms/ValidatedRadioGroup.tsx**: Small consistency fix for `parent_name` access pattern
- **openspec/specs/component-standardisation/spec.md**: Update for unified pattern
- **openspec/specs/shadcn-atom-wrappers/spec.md**: Add Select + Checkbox wrappers
- **No dependency changes, no API changes, no backend changes**
