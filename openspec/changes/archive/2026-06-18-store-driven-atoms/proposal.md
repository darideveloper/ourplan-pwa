## Why

Today's atoms (`ValidatedInput`, `ValidatedRadioGroup`) and the store are coupled to step 1: atoms type `field` as `keyof FirstStepState`, and `setField` validates against `firstStepSchema.shape` directly, ignoring the `stepSchemas` registry that already exists. The moment step 2 fields land, the atoms won't typecheck and the store won't validate them. On top of that, every atom re-implements the same store plumbing (hydration `mounted` gate, three `useFormStore` selectors, `as string` cast), and `ParentHealthRadioGroup` is a one-off molecule masquerading as reusable — the exact anti-pattern that would multiply as more fields are built.

## What Changes

- **New hook** `src/store/useField.ts` that encapsulates the store-binding contract for any field atom: `mounted` hydration gate, subscribes to the field's `value` and `error` slices, exposes a typed `setValue(field, value)`. One place for hydration handling; atoms stop duplicating it.
- **New flat `FormValues` type** in `src/store/form.ts` — the intersection of all step schema inferred types (only step 1 keys exist today, but the shape is open for steps 2–4). Atoms and the hook import `FormValues`, not `FirstStepState`.
- **Schema-registry-driven `setField`** — rewritten to resolve the owning schema for a field from `stepSchemas` (via a pre-built `field → schema` map at module load) instead of hardcoding `firstStepSchema`. Existing `stepSchemas` registry becomes the single source of truth for per-field validation.
- **Generic, thin atoms** — `ValidatedInput` and `ValidatedRadioGroup` rewritten to consume `useField(field)` and otherwise only render shadcn + label + error. No store imports, no `mounted` boilerplate, no step-specific typing. Static config (label, options, placeholder) stays in the `.astro` page as props.
- **New reusable molecule** `DynamicLabelRadioGroup` (`src/components/molecules/DynamicLabelRadioGroup.tsx`) — wraps `ValidatedRadioGroup` for the specific case of dynamic labels that interpolate other store fields. Accepts serializable props only (`field`, `options`, `labelTemplate` with `{field_name}` placeholders, `labelFields` listing which store fields to interpolate, `fallbackLabel` — the full label string used when any listed field is empty). Internally subscribes to the listed store fields and builds the label string. This is a genuinely reusable molecule (not a one-off per-field wrapper) that replaces the deleted `ParentHealthRadioGroup`.
- **Remove `ParentHealthRadioGroup` molecule** — replaced by the reusable `DynamicLabelRadioGroup` molecule. The old molecule was a one-off named after the domain field; the new molecule is parameterized (accepts `labelTemplate`, `labelFields`, `fallbackLabel` as props) and reusable for any radio group needing dynamic labels. Also fixes the latent grammar bug where the `'their'` fallback produced `"describe their's current health?"`.
- **No new atoms added in this change** — `ValidatedCheckbox`, `ValidatedSelect` etc. are out of scope; the pattern is established so future atoms follow it.

## Capabilities

### New Capabilities
- `store-bound-atoms`: Generic React atoms that wrap a shadcn primitive and bind to a single form-store field via the `useField` hook. The hook owns the hydration gate and store subscriptions; atoms own only rendering shadcn + label + error and wiring `onChange`. Atoms accept static config (label, options, placeholder) as serializable props. A reusable `DynamicLabelRadioGroup` molecule wraps the atom for dynamic-label cases (interpolating other store fields into the label via a template string).
- `field-validation-registry`: The form store resolves per-field validation by looking up the owning step schema from the `stepSchemas` registry via a pre-built `field → schema` map, rather than hardcoding a single step's schema. All step fields share one flat `FormValues` interface.

### Modified Capabilities
<!-- No existing specs in openspec/specs/ to modify -->

## Impact

- **Store** (`src/store/form.ts`): Introduce `FormValues` (intersection of step schema inferred types); rewrite `setField` to use a `field → schema` map built from `stepSchemas`; `FormStore` typing widens from `Partial<FirstStepState>` to `Partial<FormValues>`. `advanceStep` and `reset` unchanged in behaviour.
- **New hook** (`src/store/useField.ts`): New file exporting `useField<K extends keyof FormValues>(field: K)` returning `{ value, error, setValue, mounted }`.
- **Atoms** (`src/components/atoms/ValidatedInput.tsx`, `src/components/atoms/ValidatedRadioGroup.tsx`): Rewritten to consume `useField`; props re-typed against `FormValues`. Atoms accept only serializable props (static `label` string, `options`, `placeholder`). No `labelFn` — dynamic labels are handled by the `DynamicLabelRadioGroup` molecule. Future atoms follow the same shape.
- **New molecule** (`src/components/molecules/DynamicLabelRadioGroup.tsx`): Reusable molecule wrapping `ValidatedRadioGroup` for dynamic-label cases. Accepts `labelTemplate` (string with `{field_name}` placeholders), `labelFields` (array of store field names to interpolate), and `fallbackLabel` (full label string for when any listed field is empty). Handles its own hydration gate for the label.
- **Molecule replaced** (`src/components/molecules/ParentHealthRadioGroup.tsx`): Deleted. Replaced by `src/components/molecules/DynamicLabelRadioGroup.tsx` — a reusable, parameterized molecule for dynamic-label radio groups.
- **Page** (`src/pages/step1.astro`): Imports `DynamicLabelRadioGroup` from molecules; passes `field="parent_health"`, the four health options, `labelTemplate="How would you describe {parent_name}'s current health?"`, `labelFields={["parent_name"]}`, and `fallbackLabel="How would you describe their current health?"` (grammatically correct).
- **Dependencies**: None added or removed (Zustand, Zod, React already in tree).
- **Future steps**: Adding a step-2 field = add keys to `FormValues`, add a step-2 Zod schema, register it in `stepSchemas`, drop the atom in the page with `client:load`. No atom changes, no new molecules.
