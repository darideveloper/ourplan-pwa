## 1. Store Layer — Dotted-path support

- [x] 1.1 Add a `getNestedValue(obj, path)` utility in `src/store/form.ts` that traverses dotted paths (e.g. `"support_circle.0.helper_name"` → `obj.support_circle[0].helper_name`). Each segment access SHALL use safe navigation: if any parent segment is `undefined` or an array index is out of bounds, return `undefined`.
- [x] 1.2 Add a `setNestedValue(obj, path, value)` utility that returns a new object with the updated nested value (immutable clone). Handles array cloning for numeric-index segments.
- [x] 1.3 Add a `flattenNestedSchemas()` function in `src/store/form.ts` that recursively walks each step schema, detects `z.array()` wrappers, extracts the inner item schema via `.element`, and indexes each nested field name (e.g. `helper_name`, `helper_relationship`) into `fieldSchemaMap`. Reuses the same collision-detection assertion from `buildFieldSchemaMap`. Call it after `buildFieldSchemaMap()` at module load. **Type change**: widen `fieldSchemaMap`'s type from `Map<keyof FormValues, ...>` to `Map<string, ...>` since nested field names like `helper_name` are not `keyof FormValues`. Also widen the return type of `buildFieldSchemaMap` to `Map<string, z.ZodTypeAny>`.
- [x] 1.4 Update `setField` in `useFormStore`: detect dotted paths; extract the parent key (`support_circle`) to look up the parent `z.array()` schema for validation context; extract the leaf field name (`helper_name`) and look it up in the flattened `fieldSchemaMap` for per-field validation; delegate value writes to `setNestedValue`; use the dotted string directly as the flat error key (e.g. `errors["support_circle.0.helper_name"]`). **Cast fix**: The existing `fieldSchemaMap.get(field as keyof FormValues)` cast (`form.ts:204`) SHALL be changed — for dotted paths, extract the leaf field name first, then look up with `fieldSchemaMap.get(leafFieldName)` (without `as keyof FormValues` since the map type is now `Map<string, ...>`).
- [x] 1.5 Update `setField`'s store type signature: widen from `<K extends keyof FormState>(field: K, value: FormState[K])` to accept `(field: string, value: unknown)` — with a TypeScript overload keeping the strict typed variant for top-level `keyof FormState` calls.
- [x] 1.6 Update `useField` in `src/store/useField.ts` — add a function overload:
  - Overload A: `<K extends keyof FormValues>(field: K) ⇒ { value: FormValues[K], error, setValue, mounted }` (existing, unchanged)
  - Overload B: `(field: string) ⇒ { value: unknown, error, setValue, mounted }` (for dotted paths)
  - Implementation signature: `(field: string) ⇒ { value: unknown, error, setValue, mounted }`
  - Parse dotted paths: if `field` contains `.`, split segments, use `getNestedValue` for reads, pass dotted string to `setField` for writes, read `errors[field]` for errors.
- [x] 1.7 Fix hydration safety for dotted paths in `useField`: when `mounted` is `false` and the field is a dotted path, use `getNestedValue(initialState, field)` with safe navigation. If any parent is `undefined`/out-of-bounds, return `""` for string fields (checked via Zod schema from flattened `fieldSchemaMap`) or `undefined` for enum fields. This prevents crashes when `initialState.support_circle` is `[]` and the path is `support_circle.0.helper_name`.
- [x] 1.8 Fix `advanceStep` nested error clearing: after successful validation, after deleting top-level shape keys, iterate remaining error keys and delete any that start with `<shapeKey>.` (dotted prefix). For step 4 this clears `support_circle.0.helper_name`, `support_circle.1.helper_relationship`, etc.

## 2. Add Select presentation wrapper

- [x] 2.1 Create `src/components/atoms/Select.tsx` that re-exports `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`

## 3. Add ValidatedSelect atom

- [x] 3.1 Create `src/components/atoms/ValidatedSelect.tsx` — a store-binding select component that uses `useField(field)`, renders `Label` + `Select` + error message, and accepts `field`, `label`, `options`, `placeholder` props
- [x] 3.2 Ensure it imports `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/atoms/Select` (not from `ui/`)
- [x] 3.3 Verify error styling matches the pattern from `ValidatedInput` (error class on trigger, error message below)

## 4. Rewrite SupportCircleRepeater

- [x] 4.1 Add `_id: z.number().optional()` to `personSchema` in `src/store/form.ts` so the Zod schema acknowledges the transient ID. `PersonSchema` type gains optional `_id: number | undefined` — existing code unaffected.
- [x] 4.2 Add a stable ID mechanism in `SupportCircleRepeater`: when a person is added, compute the next ID from the existing data by taking `Math.max(...people.map(p => p._id ?? 0), 0) + 1`. This avoids counter collision on page reload when IDs are restored from localStorage. Assign `{ _id: nextId, ...personDefaults }`. The `_id` is stored in Zustand alongside schema data. (Do NOT use a module-level counter — it resets on page reload and collides with persisted IDs.)
- [x] 4.3 Replace `ControlledInput` with `ValidatedInput` using dotted path `"support_circle.${idx}.helper_name"`
- [x] 4.4 Replace all five `ControlledSelect` calls with `ValidatedSelect` using dotted paths (e.g. `"support_circle.${idx}.helper_relationship"`)
- [x] 4.5 Update React keys from `person.helper_name + idx` to `person._id ?? idx` (fallback to index because `_id` is typed `number | undefined` from the optional Zod schema — avoids React warnings on `key={undefined}`)
- [x] 4.6 Remove inline error comment (lines 66-68 in current file) — nested errors now work
- [x] 4.7 Widen `ValidatedInputProps.field` type in `src/components/atoms/ValidatedInput.tsx` from `field: keyof FormValues` to `field: keyof FormValues | string`
- [x] 4.8 Widen `DynamicLabelRadioGroupProps.field` type in `src/components/molecules/DynamicLabelRadioGroup.tsx` from `field: keyof FormValues` to `field: keyof FormValues | string` (passes through to `ValidatedRadioGroup` which also needs widening — but `DynamicLabelRadioGroup` is never used with dotted paths, so this is defensive consistency)
- [x] 4.9 Widen `ValidatedRadioGroupProps.field` type in `src/components/atoms/ValidatedRadioGroup.tsx` from `field: keyof FormValues` to `field: keyof FormValues | string`

## 5. Delete Controlled components

- [x] 5.1 Delete `src/components/atoms/ControlledInput.tsx`
- [x] 5.2 Delete `src/components/atoms/ControlledSelect.tsx`
- [x] 5.3 Verify `rg "ControlledInput|ControlledSelect" src/` returns zero matches

## 6. Fix ValidatedRadioGroup consistency

- [x] 6.1 In `src/components/atoms/ValidatedRadioGroup.tsx`, replace `useFormStore(state => state.parent_name)` with `useField("parent_name").value` for the dynamic label
- [x] 6.2 Ensure `mounted` from the existing `useField(field)` call is used for the display label's hydration safety

## 7. Update documentation

- [x] 7.1 Update `openspec/specs/shadcn-atom-wrappers/spec.md` to include `Select.tsx` in the wrapper table and `Checkbox.tsx` (already existing but undocumented)
- [x] 7.2 Update `openspec/specs/component-standardisation/spec.md` to reflect `Validated*`-only architecture (no Controlled components, dotted-path support in useField)
- [x] 7.3 Update `openspec/specs/shadcn-atom-wrappers/spec.md` main spec line 85 — remove `ControlledInput.tsx` and `ControlledSelect.tsx` from the list of example stateful atoms (these files will be deleted)

## 8. Build verification

- [x] 8.1 Run `pnpm build` and fix any TypeScript errors
- [x] 8.2 Run `pnpm dev` and manually verify each step page renders correctly
- [x] 8.3 Run `rg "from ['\"]@/components/ui/" src/components/atoms/` to confirm only presentation wrappers import from `ui/`
- [x] 8.4 Run `rg "React\.FC" src/components/` to confirm zero matches outside `ui/`
