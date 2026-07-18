## ADDED Requirements

### Requirement: useField accepts dotted paths for nested fields

`useField()` SHALL accept dotted-path strings (e.g. `"support_circle.0.helper_name"`) in addition to top-level `keyof FormValues` keys. When a dotted path is provided, the hook SHALL read the value from the nested path, write to the nested path via `setField`, and read the error from the corresponding dotted error key.

The implementation SHALL use a TypeScript overload: preserve `<K extends keyof FormValues>(field: K) ⇒ { value: FormValues[K], ... }` for top-level fields and add `(field: string) ⇒ { value: unknown, ... }` for dotted paths. This keeps full type safety for flat fields.

#### Scenario: useField resolves top-level field

- **WHEN** `useField("user_name")` is called
- **THEN** it SHALL return `{ value, error, setValue, mounted }` where `value` is `state.user_name`

#### Scenario: useField resolves dotted path

- **WHEN** `useField("support_circle.0.helper_name")` is called
- **THEN** it SHALL return `{ value, error, setValue, mounted }` where `value` is `state.support_circle[0].helper_name`

#### Scenario: useField reads nested error

- **WHEN** `useField("support_circle.0.helper_name")` is called and the store has `errors["support_circle.0.helper_name"]` set
- **THEN** the returned `error` SHALL be the value of `errors["support_circle.0.helper_name"]`

#### Scenario: useField writes nested value

- **WHEN** `setValue("John")` is called on the result of `useField("support_circle.0.helper_name")`
- **THEN** the store SHALL update `state.support_circle[0].helper_name` to `"John"`

### Requirement: setField handles dotted paths

The Zustand store's `setField` method SHALL accept dotted-path strings as the `field` argument. It SHALL parse the path, traverse the nested object, update the leaf value, and run validation against the appropriate Zod schema for that leaf field.

For dotted paths, `setField` SHALL extract the parent key (e.g. `support_circle` from `support_circle.0.helper_name`) and the leaf field name (e.g. `helper_name`). The leaf field name SHALL be looked up in `fieldSchemaMap` (without `as keyof FormValues` cast — the map type is now `Map<string, ...>`). `fieldSchemaMap` is populated by `flattenNestedSchemas()` to include nested field schemas from `z.array()` item schemas. The value write SHALL use `setNestedValue` for immutable nested updates, not flat property assignment.

#### Scenario: setField updates nested value

- **WHEN** `setField("support_circle.0.helper_name", "John")` is called
- **THEN** `state.support_circle[0].helper_name` SHALL equal `"John"` and the array reference SHALL be replaced (immutable update)

#### Scenario: setField validates nested value against schema

- **WHEN** `setField("support_circle.0.helper_name", "")` is called and the Zod schema for `helper_name` requires min(1)
- **THEN** `errors["support_circle.0.helper_name"]` SHALL be set to the Zod validation error message

#### Scenario: setField clears nested error on valid value

- **WHEN** `setField("support_circle.0.helper_name", "John")` is called after a previous validation error
- **THEN** `errors["support_circle.0.helper_name"]` SHALL be removed

### Requirement: flattenNestedSchemas indexes nested field schemas

A `flattenNestedSchemas()` function SHALL exist in `src/store/form.ts` that recursively walks each step schema, detects `z.array()` wrappers, extracts the inner item Zod schema (via `.element`), and indexes each nested field name into `fieldSchemaMap`. This enables per-field Zod validation for dotted-path writes (e.g. `helper_name` → `z.string().min(1)`).

**Type change**: Because nested field names like `helper_name` are not `keyof FormValues`, `fieldSchemaMap`'s type SHALL widen from `Map<keyof FormValues, z.ZodTypeAny>` to `Map<string, z.ZodTypeAny>`. The `buildFieldSchemaMap` return type shall widen similarly.

#### Scenario: Nested field names indexed in fieldSchemaMap

- **WHEN** `fieldSchemaMap.get("helper_name")` is called after module load
- **THEN** it SHALL return `z.string().min(1, "Name is required")` (the Zod schema for `helper_name` from `personSchema`)

#### Scenario: Collision detection works for nested fields

- **WHEN** a nested field name collides with an existing top-level key
- **THEN** the same assertion error mechanism from `buildFieldSchemaMap` SHALL fire

### Requirement: advanceStep clears nested error keys

When `advanceStep` successfully validates a step, it SHALL clear not only the top-level shape keys but also any error key that begins with `<shapeKey>.` (dotted prefix). This prevents nested errors like `support_circle.0.helper_name` from persisting after a successful step 4 submission.

#### Scenario: Nested errors cleared on successful advance

- **WHEN** `advanceStep("/step4")` succeeds after a previous validation failure set `errors["support_circle.0.helper_name"]`
- **THEN** `errors["support_circle.0.helper_name"]` SHALL be removed from the store

### Requirement: setField store type signature widened

The `FormStore` interface's `setField` method SHALL accept `string` as the field type in addition to the typed top-level keys. This is achieved via a TypeScript overload: `<K extends keyof FormState>(field: K, value: FormState[K])` for top-level calls and `(field: string, value: unknown)` for dotted-path calls.

#### Scenario: setField accepts dotted string

- **WHEN** `useFormStore.getState().setField("support_circle.0.helper_name", "John")` is called in TypeScript
- **THEN** it SHALL compile without type errors

#### Scenario: setField remains type-safe for top-level keys

- **WHEN** `useFormStore.getState().setField("user_name", "Alice")` is called
- **THEN** TypeScript SHALL still enforce that `"user_name"` is a key of `FormState` and the value matches its type

### Requirement: Stable IDs added to personSchema

`personSchema` in `src/store/form.ts` SHALL gain `_id: z.number().optional()` to store transient stable IDs on each person object. The `_id` value is assigned by `SupportCircleRepeater` when adding a person and used as the React `key` prop. The optional marker means existing code that constructs `PersonSchema` objects without `_id` continues to compile.

#### Scenario: personSchema has optional _id

- **WHEN** `personSchema` is read
- **THEN** it SHALL contain `_id: z.number().optional()`

### Requirement: Nested hydration safety

`useField()` with a dotted path SHALL maintain the same hydration safety contract as top-level fields: before mount, the returned value SHALL be the initial/empty value for the field type (empty string for strings, empty array for arrays, etc.), and after mount it SHALL reflect the actual store value.

#### Scenario: Hydration safety for nested fields

- **WHEN** `useField("support_circle.0.helper_name")` is called and `mounted` is `false`
- **THEN** `value` SHALL return `""` (the initial value for a string field)

#### Scenario: Hydration safety with empty parent array

- **WHEN** `useField("support_circle.0.helper_name")` is called, `mounted` is `false`, and `initialState.support_circle` is `[]`
- **THEN** `value` SHALL return `""` without throwing (safe-navigation prevents crash on `[0]` of empty array)
