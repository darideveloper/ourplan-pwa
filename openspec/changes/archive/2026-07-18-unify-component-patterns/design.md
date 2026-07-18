## Context

The current codebase has two parallel component patterns: `Validated*` (store-driven via `useField`) and `Controlled*` (props-driven). All flat-form step fields use `Validated*` successfully — they bind directly to the Zustand store. The `Controlled*` components exist for one reason only: `SupportCircleRepeater`, which manages an array of nested PersonSchema objects and needs to access sub-fields like `support_circle[0].helper_name`.

The `useField` hook is typed as `useField<K extends keyof FormValues>(field: K)` — it only accepts top-level keys. This limitation forces the `SupportCircleRepeater` to manage the entire array at the top level via `setValue([])` and pass individual values down as props. Inline validation for nested items is broken (errors exist at paths like `support_circle.0.helper_name` but cannot be surfaced).

Existing conventions from `component-standardisation` and `shadcn-atom-wrappers` specs are already partially applied. Some earlier refactors fixed import paths and declaration styles, but the dual-pattern architecture remains.

### Known limitation: fieldSchemaMap only has top-level keys

The `fieldSchemaMap` built by `buildFieldSchemaMap()` only contains top-level step schema keys (14 total — `user_name`, `parent_name`, `parent_health`, `lpa_status`, `psr_status`, `documents_loc`, `home_type`, `ourlens_completed`, `hazard_flags`, `digital_literacy`, `has_pets`, `hobbies_social`, `support_circle`, `disclaimer_agreed`, `email_recipients`, `custom_message`). Nested fields like `helper_name`, `helper_relationship` inside `personSchema` are NOT indexed. This means `setField("helper_name", "")` would skip schema validation entirely today.

### Known pre-existing bug: advanceStep nested error leak

When `advanceStep` validation fails for step 4, errors are stored as `errors["support_circle.0.helper_name"]` (flat dotted keys). When validation succeeds, the error-clearing loop only deletes top-level shape keys (`support_circle`), so nested errors like `support_circle.0.helper_name` persist in the store indefinitely until manually cleared.

## Goals / Non-Goals

**Goals:**
- Eliminate `ControlledInput` and `ControlledSelect` entirely — all form components use `Validated*`
- Make `useField()` accept dotted paths (e.g. `"support_circle.0.helper_name"`)
- Make `setField()` handle dotted-path writes with nested validation
- Add `Select.tsx` presentation wrapper and `ValidatedSelect.tsx` stateful atom
- Rewrite `SupportCircleRepeater` to use `ValidatedInput`/`ValidatedSelect` with dotted paths
- Add stable IDs to array items for reliable React keys
- Fix `ValidatedRadioGroup` to use `useField("parent_name")` instead of raw `useFormStore`

**Non-Goals:**
- No changes to existing FormValues field structure (except adding optional `_id` to personSchema)
- No changes to step pages, layouts, or navigation
- No changes to store persist/partialize behaviour
- No backend or API changes

## Decisions

### Decision 1: Dotted-path parsing lives in `useField`, not the store

**Option A** (chosen): `useField` accepts `string` and handles dot-path parsing. It returns a proxy-like interface where `value` is the nested value, `setValue` writes to the nested path, and `error` reads from the nested error key. The store's `setField` also gets a parallel update to accept dotted strings.

**Hydration safety**: Before mount, `useField` with dotted paths returns the field's type-appropriate initial value — empty string for string fields, `undefined` for enums, empty array for array fields. The fallback is computed by walking the dotted path against `initialState` with safe navigation: if any parent segment is `undefined` or an array index is out of bounds, the fallback returns `""` for string fields (determined by checking the Zod schema at the leaf), preserving the same contract as top-level `useField` calls. This prevents crashes on paths like `support_circle.0.helper_name` when `initialState.support_circle` is `[]`.

**Option B** (rejected): Create a separate `useSubField(parentField, index, subField)` hook. This would add API surface but not eliminate `Controlled*` components — each sub-field would still need different usage from flat fields.

**Rationale**: Dotted paths make `useField` the universal API for any field depth. `useField("user_name")` and `useField("support_circle.0.helper_name")` look and behave identically. Consumers don't need to know whether a field is top-level or nested — they just pass the path.

### Decision 2: Immutable array updates, no immer

When writing to a nested path like `support_circle.0.helper_name = "John"`, the store clones the array, replaces the item at index 0, and sets the new array. This is the same pattern `SupportCircleRepeater` already uses, but moved inside `setField`.

**Why not immer?** The existing codebase has no immer dependency. The array-of-objects pattern has max ~20 items, so cloning is negligible. Adding a dependency for this is not justified.

### Design Addition: flattenNestedSchemas utility

Before Decision 3's schema lookup can work, a new utility is needed. The existing `fieldSchemaMap` only has top-level keys (`support_circle`, not `helper_name`). A `flattenNestedSchemas()` function recursively walks each step schema, detecting `z.array()` wrappers, extracts the inner item schema (via `.element`), and indexes each nested field name (e.g. `helper_name`, `helper_relationship`) into a `Map<string, ...>` that also includes the top-level keys (the map type is widened from `Map<keyof FormValues, ...>` to `Map<string, ...>` to accommodate nested field names).

Example: `fourthStepSchema` has shape `{ support_circle: z.array(personSchema) }`. The walker sees `z.array()`, gets `personSchema` via `.element`, reads `personSchema.shape`, and adds `helper_name`, `helper_relationship`, `helper_proximity`, `helper_time`, `helper_superpower` to the map.

This runs once at module load alongside `buildFieldSchemaMap()`. Field-name uniqueness is maintained: if a nested field name collides with an existing top-level key, the collision error fires (same as the existing assertion).

**Type change**: `fieldSchemaMap`'s type SHALL widen from `Map<keyof FormValues, z.ZodTypeAny>` to `Map<string, z.ZodTypeAny>` because nested field names like `helper_name` are not `keyof FormValues`. The `buildFieldSchemaMap()` return type updates in tandem. The existing `as keyof FormValues` casts in `setField` (`form.ts:204`) SHALL be removed — for dotted paths, the leaf field name is looked up without a cast since the map accepts `string` keys.

**Why not inline traversal in setField?** A pre-built map is O(1) lookup on every keystroke (fast path). Inline traversal on every `setField` call would parse Zod's `.element` / `.shape` nesting on every write. For <20 items the cost is negligible, but the map approach is simpler and matches the existing pattern.

### Decision 3: Zod schema lookup for nested validation (corrected)

For nested paths, `setField` extracts the leaf field name (e.g. `helper_name` from `support_circle.0.helper_name`), then looks it up in the flattened `fieldSchemaMap` (populated by `flattenNestedSchemas()`). This gives the per-item Zod schema for individual field validation — `z.string().min(1, "Name is required")` for `helper_name`, `z.enum([...])` for `helper_relationship`, etc.

**Limitation**: Array-level validation (e.g. "support_circle must have at least 1 person") remains on the top-level `support_circle` key, handled by `fourthStepSchema`. Per-item validation is handled by the individual `personSchema` fields — now correctly indexed.

### Decision 4: Stable IDs computed from existing data

The `SupportCircleRepeater` currently uses `person.helper_name + idx` as React keys — fragile if names are empty or duplicate. The design stores a numeric `_id` on each person object (in Zustand alongside schema data) and uses it as the React key.

The ID is computed from the existing array by taking `people.reduce((max, p) => Math.max(max, p._id ?? 0), 0) + 1` when adding a person. This avoids the collision problem of a module-level counter: after page reload, persisted IDs from localStorage are used as the baseline. (Functionally identical to `Math.max(...people.map(...))` but avoids spreading into `Math.max` — safer for large arrays, though bounded at ~20 items.)

**Why not UUID?** No UUID dependency in the project. An incrementing numeric ID scoped to the existing data is sufficient (max ~20 items). IDs survive page navigation via Zustand's persist middleware.

**Why not module-level counter?** A `let nextPersonId = 1` counter resets on page reload. If persisted data has items with IDs 1,2,3, adding a new person would create duplicate ID 1 — causing React key collision and incorrect reconciliation.

### Decision 5: Consistent parent_name access in ValidatedRadioGroup

`ValidatedRadioGroup` currently uses `useFormStore(state => state.parent_name)` directly. `ValidatedCheckboxGroup` uses `useField("parent_name")`. Both do the same thing. The design unifies on `useField("parent_name")` — it's already imported in the file, it provides hydration safety, and it's the canonical pattern.

### Decision 6: _id added to personSchema for type soundness

The stable ID (`_id`) is stored on each person object. For the Zustand state to remain type-sound with `PersonSchema`, `_id: z.number().optional()` is added to `personSchema`. This means `PersonSchema` gains an optional `_id` field — existing code unaffected because optional fields default to `undefined`.

**Why not compute `_id` at render time?** Using a `useRef` counter loses IDs on remount (page navigation). Using `crypto.randomUUID()` pulls in a crypto dependency. Making `_id` optional in the schema and storing it in Zustand alongside the person data means IDs survive page navigation (via persist middleware) and the Zod schema acknowledges their existence.

**React key type**: Since `_id: z.number().optional()`, TypeScript infers `_id` as `number | undefined`. The `key` prop SHALL use `person._id ?? idx` (fallback to index) to avoid React warnings on `undefined` keys.

### Decision 7: advanceStep nested error clearing

The current `advanceStep` clears only top-level shape keys after successful validation:
```
for (const key of shapeKeys) { delete newErrors[key]; }
```
This leaves nested error entries like `support_circle.0.helper_name` in the errors map after a successful step 4 submission. The fix: after clearing top-level keys, also delete any error key that starts with `<shapeKey>.` (dotted prefix). For step 4, this would delete `support_circle.0.helper_name`, `support_circle.1.helper_relationship`, etc.

**Performance**: The errors object is typically small (<20 entries). Iterating and filtering by prefix is negligible.

## Risks / Trade-offs

**[Risk] Dotted-path strings are loosely typed**: `useField("support_circle.0.helper_name")` is a string — TypeScript can't verify the path segments exist at compile time.

→ **Mitigation**: Add a runtime validation layer in `useField` that throws a clear error if the path structure doesn't match the store shape. Keep `K extends keyof FormValues` as the generic constraint for top-level calls; dotted paths use `string` overload.

**[Risk] Array index shifts on remove**: If person at index 0 is removed, indices shift. All rendered fields would re-read from the new indices.

→ **Mitigation**: This is the same behaviour as the current implementation. The store's `support_circle` array is the source of truth; React reconciles correctly because keys use the stable `_id`, not the array index. The dotted path always reads from the current state, so after removal `support_circle.0.helper_name` is the new first item.

**[Risk] Performance on rapid typing**: Each keystroke in a nested field clones the array and creates a new store entry (via persist middleware).

→ **Mitigation**: The array size is bounded (< 20 items). Cloning an array of small objects is negligible. If profiling reveals issues later, immer can be added — the `setField` abstraction makes this a one-line change.

**[Risk] ControlledSelect imports from ui/ directly**: Currently violates `shadcn-atom-wrappers` spec.

→ **Mitigation**: This is fixed as part of the change — `ControlledSelect` is deleted and replaced by `ValidatedSelect` which imports from `atoms/Select`.

**[Risk] fieldSchemaMap collision on flatten**: `flattenNestedSchemas` may encounter a nested field name (e.g. `parent_name`) that already exists as a top-level key.

→ **Mitigation**: The flattening utility reuses the same collision detection from `buildFieldSchemaMap` — throws at module load if a duplicate is found. Since Zod schema field names are unique across `FormValues` (field names like `user_name`, `parent_name` are step-prefixed per convention), collision is unlikely. If it occurs, rename the conflicting nested field.

**[Risk] advanceStep prefix matching clears sibling-step errors**: If two steps share a field name prefix (unlikely given step-prefixed naming), clearing `support_circle.*` could clear unrelated errors.

→ **Mitigation**: The prefix-clear is scoped to the completed step's shape keys only. Step-prefixed naming convention (`step1_`, `step2_`, etc.) prevents collisions. Add a test assertion if concern grows.

**[Risk] ValidatedInput and ValidatedRadioGroup field prop type is narrowed**: Both define `field: keyof FormValues`, which rejects dotted-path strings like `"support_circle.0.helper_name"`.

→ **Mitigation**: Widen the prop type to `field: keyof FormValues | string`. TypeScript loses compile-time checking for dotted paths, but runtime validation in `useField` catches malformed paths. Top-level fields retain full type safety via the `keyof FormValues` overload.
