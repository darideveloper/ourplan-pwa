## MODIFIED Requirements

### Requirement: useField accepts dotted paths for nested fields

`useField()` SHALL accept dotted-path strings (e.g. `"support_circle.0.helper_name"`) in addition to top-level `keyof FormValues` keys. When a dotted path is provided, the hook SHALL read the value from the nested path, write to the nested path via `setField`, and read the error from the corresponding dotted error key.

The implementation SHALL use a TypeScript overload: preserve `<K extends keyof FormValues>(field: K) ⇒ { value: FormValues[K] | undefined, ... }` for top-level fields and add `(field: string) ⇒ { value: unknown, ... }` for dotted paths. The typed overload's `value` SHALL include `| undefined` to reflect that the store is `Partial<FormValues>` and any field may be unset at runtime.

#### Scenario: useField resolves top-level field

- **WHEN** `useField("user_name")` is called
- **THEN** it SHALL return `{ value, error, setValue, mounted }` where `value` is `state.user_name` (type includes `| undefined`)

#### Scenario: useField resolves dotted path

- **WHEN** `useField("support_circle.0.helper_name")` is called
- **THEN** it SHALL return `{ value, error, setValue, mounted }` where `value` is `state.support_circle[0].helper_name`

#### Scenario: useField reads nested error

- **WHEN** `useField("support_circle.0.helper_name")` is called and the store has `errors["support_circle.0.helper_name"]` set
- **THEN** the returned `error` SHALL be the value of `errors["support_circle.0.helper_name"]`

#### Scenario: useField writes nested value

- **WHEN** `setValue("John")` is called on the result of `useField("support_circle.0.helper_name")`
- **THEN** the store SHALL update `state.support_circle[0].helper_name` to `"John"`
