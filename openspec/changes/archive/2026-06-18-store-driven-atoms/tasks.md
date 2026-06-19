## 1. Store: `FormValues` + schema-registry-driven `setField`

- [x] 1.1 In `src/store/form.ts`, export a `FormValues` type as the intersection of all step schema inferred types: `type FormValues = FirstStepState` (today; grows as `& SecondStepState & ...` when steps 2–4 land). Leave a comment that it grows as steps are added. This keeps `FormValues` automatically in sync with Zod schemas.
- [x] 1.2 Update `FormState` to extend `Partial<FormValues>` instead of `Partial<FirstStepState>`. Keep `FirstStepSchema`/`FirstStepState` exports intact (used by `stepSchemas` registry).
- [x] 1.3 Add a `fieldSchemaMap: Map<keyof FormValues, ZodTypeAny>` built at module load by iterating `stepSchemas` and inverting the `field → schema` relationship. Include a uniqueness assert that throws if a field name appears in more than one step schema (name the colliding field and competing step paths in the error message).
- [x] 1.4 Rewrite `setField` to look up `fieldSchemaMap.get(field)` and validate `value` against the resolved schema's `.shape[field]`. Remove the direct `firstStepSchema.shape[field]` reference. Preserve current behaviour for un-schema'd fields (set value, no error).
- [x] 1.5 Verify `advanceStep` and `reset` are untouched in behaviour; update their typings only if needed to compile against `FormValues` (no logic change).
- [x] 1.6 Run `pnpm build` to confirm the store compiles and existing consumers (`StepGuard`, `ContinueButton`, `ProgressBar`, `ResumeRedirect`) still typecheck.

## 2. Hook: extract `useField` into `src/store/useField.ts`

- [x] 2.1 Create `src/store/useField.ts` exporting a generic hook `useField<K extends keyof FormValues>(field: K)` returning `{ value: FormValues[K], error: string | undefined, setValue: (value: FormValues[K]) => void, mounted: boolean }`.
- [x] 2.2 Inside the hook, implement the hydration gate: `mounted` starts `false`, set to `true` in a `useEffect`. Subscribe to `useFormStore(state => state[field])` for `value`, `useFormStore(state => state.errors[field])` for `error`, and `useFormStore(state => state.setField)` for `setValue`.
- [x] 2.3 Make `value` hydration-safe: when `mounted` is `false`, return the field's initial/empty value (e.g. `""` for string fields, `undefined` for enums) so server-rendered HTML and the first client render match. When `mounted` is `true`, return the real stored value.
- [x] 2.4 `setValue(field, value)` SHALL delegate to `setField(field, value)` from the store.
- [x] 2.5 Add JSDoc to the hook explaining the `mounted` contract and why atoms must consume `value` (not the raw store) to avoid hydration mismatches.
- [x] 2.6 Run `pnpm build` to confirm the hook compiles standalone.

## 3. Atoms: rewrite to consume `useField`

- [x] 3.1 Rewrite `src/components/atoms/ValidatedInput.tsx` to call `useField(field)`. Remove the local `mounted` state, the three `useFormStore` calls, the `as string` cast, and the `useFormStore` import. Render shadcn `<Input>` + `<Label>` + error span; wire `onChange` to `setValue(e.target.value)`. Use `mounted ? value : ""` for the input's `value` prop (or rely on the hook's hydration-safe `value`).
- [x] 3.2 Re-type `ValidatedInputProps.field` as `keyof FormValues` (import from `@/store/form`). Drop the `FirstStepState` import.
- [x] 3.3 Rewrite `src/components/atoms/ValidatedRadioGroup.tsx` to call `useField(field)`. Same removals as 3.1. Render the existing radio-group UI; wire `onChange` to `setValue(option.value)`. Preserve all current styling/className logic.
- [x] 3.4 Re-type `ValidatedRadioGroupProps.field` as `keyof FormValues`. Drop the `FirstStepState` import.
- [x] 3.5 Run `pnpm build` to confirm both atoms compile against the new hook and `FormValues` typing.

## 4. Molecule: create `DynamicLabelRadioGroup`

- [x] 4.1 Create `src/components/molecules/DynamicLabelRadioGroup.tsx` exporting a reusable molecule that wraps `ValidatedRadioGroup`. Props: `field: keyof FormValues`, `options: Option[]`, `labelTemplate: string` (with `{field_name}` placeholders), `labelFields: (keyof FormValues)[]`, `fallbackLabel: string`.
- [x] 4.2 Inside the molecule, implement the hydration gate (`mounted` starts `false`, set to `true` in `useEffect`). Subscribe to each field in `labelFields` via `useFormStore` with `useShallow` (to avoid infinite re-renders from new object references). When all `labelFields` are present, build the label string by replacing `{field_name}` placeholders with stored values. When any field is empty, use `fallbackLabel` directly. Before `mounted`, use `fallbackLabel` to avoid SSR mismatch.
- [x] 4.3 Pass the computed label as the static `label` prop to `ValidatedRadioGroup`. Pass through `field` and `options`.
- [x] 4.4 Run `pnpm build` to confirm the molecule compiles.

## 5. Page: replace `ParentHealthRadioGroup` with `DynamicLabelRadioGroup`

- [x] 5.1 In `src/pages/step1.astro`, replace the `ParentHealthRadioGroup` import with `DynamicLabelRadioGroup` from `@/components/molecules/DynamicLabelRadioGroup`.
- [x] 5.2 Render `<DynamicLabelRadioGroup field="parent_health" options={[...the four health options...]} labelTemplate="How would you describe {parent_name}'s current health?" labelFields={["parent_name"]} fallbackLabel="How would you describe their current health?" client:load />`.
- [x] 5.3 Delete `src/components/molecules/ParentHealthRadioGroup.tsx`.
- [x] 5.4 Run `pnpm build` to confirm `step1.astro` compiles and the old molecule deletion doesn't leave dangling references.

## 6. Verification: build + manual smoke test

- [x] 6.1 Run `pnpm build` end-to-end; confirm no TypeScript errors and the production build completes.
- [x] 6.2 Run `pnpm dev`, open `localhost:4321/step1`, and verify: the `user_name` input renders empty, the `parent_name` input renders empty, and the health radio group's label reads `How would you describe their current health?` (correct fallback, no `"their's"`).
- [x] 6.3 Type `Mum` into the `parent_name` input; confirm the health radio group's label updates to `How would you describe Mum's current health?` without a full reload.
- [x] 6.4 Select a health option; confirm the radio selection persists in the UI and the custom radio circle fills.
- [x] 6.5 Click `Continue` with `user_name` or `parent_name` empty; confirm validation errors appear under the offending inputs and navigation does not advance.
- [x] 6.6 Fill all fields validly and click `Continue`; confirm navigation advances to `/step2`.
- [x] 6.7 Reload the page; confirm all entered values repopulate from localStorage (Zustand `persist`).
- [x] 6.8 Open `src/store/form.ts` and confirm `setField` no longer references `firstStepSchema` directly (uses `fieldSchemaMap`).
- [x] 6.9 Open any atom and confirm there is no `import { useFormStore }` and no `mounted` state local to the atom (all flow through `useField`).
- [x] 6.10 Open `DynamicLabelRadioGroup.tsx` and confirm it accepts only serializable props (no function props), wraps `ValidatedRadioGroup`, and handles its own hydration gate for the label.
- [x] 6.11 Run `openspec verify --change "store-driven-atoms"` to validate the implementation against the specs.
