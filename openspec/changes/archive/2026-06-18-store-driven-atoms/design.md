## Context

The form store (`src/store/form.ts`) and the validated atoms (`src/components/atoms/ValidatedInput.tsx`, `src/components/atoms/ValidatedRadioGroup.tsx`) were built to prove the pattern on step 1 only. They work, but they bake step-1 specifics into shared infrastructure:

- Atom props type `field` as `keyof FirstStepState` — step-2 fields won't typecheck.
- `setField` validates against `firstStepSchema.shape[field]` directly, even though a `stepSchemas` registry already exists at `src/store/form.ts:44` and is correctly used by `advanceStep`.
- Each atom re-implements the hydration `mounted` gate, three `useFormStore` selector calls, and a `value as string` cast. Two atoms today; six planned means six copies of the same hydration-sensitive code.
- `ParentHealthRadioGroup` (`src/components/molecules/ParentHealthRadioGroup.tsx`) is a one-off wrapper named after the domain field, doing two jobs (static config + dynamic-label interpolation). It's the seed of the anti-pattern the user wants to avoid: a molecule per field.

Constraints:

- Stack is fixed: Astro 6.4 + React islands + Zustand + Zod + shadcn/ui (see `AGENTS.md`).
- Each interactive element renders with `client:load` as its own island — granular hydration is the established Astro idiom and stays.
- No backend in this repo; the store is the single source of truth and persists to localStorage via Zustand `persist`.
- No tests or CI configured; verification is `pnpm build` + manual smoke per step.

Stakeholders: the developer adding steps 2–4 next.

## Goals / Non-Goals

**Goals:**
- Make atoms generic across all steps without per-step copies.
- Centralise the store-binding + hydration contract in one hook so it's fixed once.
- Make `setField` schema-registry-driven so adding a step only means registering its Zod schema.
- Eliminate the one-off `ParentHealthRadioGroup` molecule; replace it with a reusable, parameterized `DynamicLabelRadioGroup` molecule.
- Keep the existing Astro idiom: one `client:load` island per field, static config in `.astro`.
- Preserve current observable behaviour: same UI, same validation messages, same persistence, same `advanceStep`/`reset` semantics.

**Non-Goals:**
- Adding new atoms (`ValidatedCheckbox`, `ValidatedSelect`, etc.) — the pattern is established; future atoms follow it.
- Building step 2–4 form content — only the infrastructure those steps will use.
- Changing the persistence key (`ourplan-form-storage`) or stored shape in a way that requires migration — `FormValues` is a superset of `FirstStepState`, so existing localStorage loads cleanly.
- Touching `advanceStep`, `reset`, `StepGuard`, `ContinueButton`, `ProgressBar`, `StepLayout`, or any other non-atom consumer of the store.
- Adding tests or CI.

## Decisions

### Decision 1: Extract a `useField` hook in `src/store/useField.ts`

**Choice:** A single hook owns the hydration gate, the `value`/`error` subscriptions, and `setValue`. Atoms consume it and own only rendering + `onChange` wiring.

**Why:** Today every atom duplicates `useState(false)` + `useEffect(setMounted(true))` + three `useFormStore` calls + a `value as string` cast. Hydration bugs (mismatched server/client render, flash of empty input on reload) live in that boilerplate. Centralising it means fixing the hydration strategy once. Atoms shrink to ~20 lines and become trivially reusable.

**Alternatives considered:**
- *Keep plumbing in each atom.* Rejected: duplication grows linearly with atom count and hydration logic drifts.
- *Generic `<StoreField type="input">` super-component.* Rejected: JSX gets ugly (discriminated unions for per-primitive props), loses per-primitive typing on options/children, and obscures the shadcn primitive being wrapped. Hook + thin per-primitive atoms keeps each atom honest about what it renders.

### Decision 2: Hook location is `src/store/useField.ts`, not `src/lib/`

**Choice:** Co-locate the hook with the store it reads from.

**Why:** `useField` is structurally coupled to `FormStore`'s shape (`value`, `errors`, `setField`) and to `FormValues`. Putting it in `src/lib/` next to `cn()` misrepresents it as a generic utility. `src/store/` makes the coupling obvious and keeps the store's public surface (store + hook) in one place.

**Alternatives considered:**
- `src/lib/useField.ts`. Rejected: lib is for framework-agnostic helpers (`cn`); this is store-bound.

### Decision 3: Flat `FormValues` as intersection of step schema types

**Choice:** `FormValues` is defined as the intersection of all step schema inferred types: `type FormValues = FirstStepState & SecondStepState & ...` (growing as steps are added). Today it equals `FirstStepState`. The store continues to be a flat Zustand store.

**Why:** The intersection type stays automatically in sync with Zod schemas — adding a field to a step schema automatically adds it to `FormValues`. No manual duplication to drift out of sync. Matches the existing store shape and persistence layout (no migration). Atoms don't need to know which step a field belongs to — they just bind to a key.

**Alternatives considered:**
- *Manual `interface FormValues { ... }`.* Rejected: drifts from Zod schemas — someone adds a field to `firstStepSchema` but forgets to update `FormValues`.
- *Mapped type from `stepSchemas` registry.* Rejected: complex to implement, marginal benefit over the intersection approach.
- *Nested by step* (`step1.user_name`, `step2.foo`). Rejected: forces a store-shape migration of existing localStorage data, complicates atom props (`field="step2.foo"` strings or nested keys), and gains nothing unless field names collide across steps. No collisions are anticipated.
- *Per-step `FormValues` interfaces* (`Step1Values`, `Step2Values`, atoms typed against the union). Rejected: atoms would need a step discriminator or generic-per-call-site; the intersection is simpler and equivalent.

**Risk noted:** if two steps ever need the same field name with different validation (e.g. `notes` on step 2 and step 4 with different max lengths), the flat shape can't express it. Mitigation: namespace at the field-name level (`step2_notes`, `step4_notes`) when that arises — don't restructure the store for a hypothetical.

### Decision 4: `setField` resolves schemas via a pre-built `field → schema` map

**Choice:** At module load, build `fieldSchemaMap: Map<keyof FormValues, ZodTypeAny>` by iterating `stepSchemas` and inverting the `field → schema` relationship. `setField` looks up `fieldSchemaMap.get(field)` and validates against that single schema's `.shape[field]`.

**Why:** The current `setField` hardcodes `firstStepSchema.shape[field]`. The registry already exists and `advanceStep` already uses it correctly. The map is O(1) lookup, built once, and stays in sync with `stepSchemas` automatically (rebuilt if the registry is mutated, though it isn't). Keeps `setField` cheap on every keystroke.

**Alternatives considered:**
- *Iterate `stepSchemas` on every `setField` call.* Rejected: wasteful (runs on every keystroke) even though schemas are small; the map is cleaner.
- *Per-step `setField` variants.* Rejected: atoms don't know which step they're in, and shouldn't.

**Edge case — field appears in multiple step schemas:** if a future field name is shared across steps with different validation, the map would keep the last-registered schema. Mitigation: the Decision 3 risk note (namespace field names) prevents this from arising. If it ever does, the map builder should `assert` uniqueness and fail loud at module load rather than silently pick a winner.

### Decision 5: Dynamic labels via reusable `DynamicLabelRadioGroup` molecule, not atom prop

**Choice:** Create a reusable molecule `DynamicLabelRadioGroup` that wraps `ValidatedRadioGroup` for dynamic-label cases. The molecule accepts serializable props only: `field` (which field to bind), `options` (radio options), `labelTemplate` (string with `{field_name}` placeholders), `labelFields` (array of store field names to interpolate), and `fallbackLabel` (the full label string used when any listed field is empty). The molecule subscribes to the listed store fields (via `useShallow` to avoid infinite re-renders from new object references), builds the label string, and passes it to the atom. Atoms accept only a static `label` string — no function props.

**Why:** Astro cannot pass functions from `.astro` pages to `client:load` React islands — props are JSON-serialized, and functions are not JSON-serializable. The `labelFn` approach (atom prop accepting a function) is architecturally impossible. A molecule is the correct layer: it's a `.tsx` component that can read from the store internally, while accepting only serializable props from the `.astro` page. The molecule is genuinely reusable (parameterized, not hardcoded to one field) — any radio group needing a dynamic label uses it with different `labelTemplate`/`labelFields`/`fallbackLabel` props. Using `fallbackLabel` (the full label string) rather than a per-field `fallback` avoids English possessive grammar issues (e.g. `"their's"` when `"their"` + `'s` are concatenated).

**Alternatives considered:**
- *`labelFn` prop on the atom.* Rejected: Astro cannot serialize functions across the `.astro` → `client:load` boundary. The page would need to pass a function, which is impossible.
- *Inline the dynamic label logic in the `.astro` page.* Rejected: `.astro` pages can't read Zustand at hydration time without causing SSR/client mismatch. The logic must live in a React island.
- *One-off molecule per dynamic field (e.g. `ParentHealthRadioGroup`).* Rejected: the anti-pattern the user wants to avoid — molecules named after domain fields, not reusable by behaviour.
- *Make `label` always a function.* Rejected: same serialization problem as `labelFn`, plus forces every static-label call site to wrap in `() => "..."`.

### Decision 6: Replace `ParentHealthRadioGroup` with reusable `DynamicLabelRadioGroup`

**Choice:** Delete `src/components/molecules/ParentHealthRadioGroup.tsx` (one-off, domain-named). Create `src/components/molecules/DynamicLabelRadioGroup.tsx` (reusable, behaviour-named). `step1.astro` imports `DynamicLabelRadioGroup` and passes serializable props: `field="parent_health"`, the four health options, `labelTemplate="How would you describe {parent_name}'s current health?"`, `labelFields={["parent_name"]}`, `fallbackLabel="How would you describe their current health?"`. The `fallbackLabel` is a complete grammatically-correct sentence — no `'s` dangling issue when `parent_name` is empty.

**Why:** The old molecule was a one-off named after the domain field (`ParentHealthRadioGroup`), doing two jobs (static config + dynamic-label interpolation). The new molecule is parameterized — it doesn't know which fields or what template, only how to interpolate `{field_name}` placeholders from the store. Any future radio group needing a dynamic label reuses it with different props. The naming convention (behaviour, not domain) signals reusability.

**Alternatives considered:**
- *Keep `ParentHealthRadioGroup` as-is.* Rejected: one-off, domain-named, seed of the anti-pattern.
- *Delete the molecule entirely, inline config in `step1.astro`.* Rejected: the dynamic-label logic needs a React island (Astro can't read Zustand at hydration). Without a molecule, that logic has nowhere to live.

### Decision 7: No persistence migration; existing localStorage loads as-is

**Choice:** `FormValues` is a superset of `FirstStepState` and the persisted shape (`{ user_name, parent_name, parent_health, errors, currentStep }`) is unchanged. Existing users' localStorage loads cleanly.

**Why:** Avoids a migration for zero behavioural gain. The `persist` middleware already handles missing keys gracefully (defaults from `initialState`).

## Risks / Trade-offs

- **[Hook hides hydration logic from atom authors]** → Mitigation: the hook is the only store-binding surface; atom authors explicitly call `useField(field)` and consume `mounted`. The contract is visible in one file. Document the `mounted` rule in the hook's JSDoc.
- **[Flat `FormValues` can't express same-name fields across steps]** → Mitigation: Decision 3 risk note — namespace field names (`step2_notes`) if it ever arises; add a uniqueness assert in the map builder to fail loud rather than silently pick a winner.
- **[`DynamicLabelRadioGroup` subscribes to all listed `labelFields`, re-renders on any change]** → Mitigation: `labelFields` is an explicit array, so the molecule only subscribes to the fields it needs (not the whole store). Zustand's shallow equality keeps re-renders bounded. If a molecule ever lists too many fields and re-renders become observable, narrow `labelFields` to only the fields the template actually uses.
- **[No tests; regression risk on step 1]** → Mitigation: tasks include a manual smoke-test checklist (load step 1, type a name, watch the health label interpolate, submit with empty fields, see errors, reload to confirm persistence). `pnpm build` is the type-safety gate.
- **[`molecules/` now contains one file — risk of future one-off molecules creeping back]** → Mitigation: `DynamicLabelRadioGroup` is named by behaviour, not domain, and is genuinely parameterized. The naming convention and parameterized props set the pattern. `AGENTS.md` already documents `molecules/` as "basic combinations of atoms" — this molecule fits that definition.
- **[Atom prop type widening may surface latent `as string` bugs]** → Mitigation: `useField<K>` is generic on the field key, so `value` is typed `FormValues[K]` and the cast disappears. If a field's value type isn't `string` (future boolean/enum fields), the atom must handle it — but today all atoms are string-valued and the typed `value` will catch non-string fields at compile time.

## Migration Plan

This is a refactor with no behaviour change and no persistence migration.

1. Build the hook and the new `FormValues` type; rewrite `setField` against the registry map. Existing atoms still compile because `FirstStepState`'s keys are a subset of `FormValues`.
2. Rewrite each atom to consume `useField`; re-type props against `FormValues`. Atoms accept only serializable props (static `label` string).
3. Create `DynamicLabelRadioGroup` molecule; delete `ParentHealthRadioGroup`; update `step1.astro` to use the new molecule with serializable props.
4. `pnpm build` to typecheck. Manual smoke-test step 1 end-to-end (see tasks checklist).
5. Rollback strategy: `git revert` the change. No data migration to undo; localStorage shape is unchanged.

## Open Questions

1. **`DynamicLabelRadioGroup` template syntax** — use `{field_name}` placeholders (simple string replacement) or a more expressive template syntax? Current decision: `{field_name}` placeholders — sufficient for the known use case, easy to extend later if needed. Confirm acceptable.
2. **Uniqueness assert in `fieldSchemaMap` builder** — fail loud at module load if a field name appears in two step schemas? Current decision: yes, assert. Confirm.
