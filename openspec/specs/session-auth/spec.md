# session-auth

## Requirements

### Requirement: Session store definition
The system SHALL provide a Zustand store at `src/store/session.ts` for session/access state with localStorage persistence.

#### Scenario: Store is created
- **WHEN** the session store module is imported
- **THEN** it SHALL export a Zustand store with `persist` middleware writing to localStorage key `ourplan-session`

#### Scenario: Store fields
- **WHEN** the session store is initialised
- **THEN** it SHALL contain the following fields: `codeInput` (string), `termsChecked` (boolean), `code` (string, persisted), `isValid` (boolean | null), `isValidating` (boolean), `apiError` (string | null, API-level error), `errors` (Record<string, string>, map of Zod field errors), `validateCodeAction` (async function that validates both fields via Zod, calls API, handles redirect on success, sets `apiError` on failure), `setTermsChecked` (function), `setCodeInput` (function), and `reset` (function)
- **THEN** Zod schemas for `codeInput` (`z.string().min(1)`) and `termsChecked` (`z.boolean().refine(val => val === true)`) SHALL be defined in `src/store/session.ts` and imported by `useFieldSession`

#### Scenario: Persisted fields
- **WHEN** the store state is persisted to localStorage
- **THEN** only `code` and `isValid` SHALL be persisted (transient fields like `isValidating`, `apiError`, `codeInput`, `termsChecked` SHALL be excluded)

### Requirement: Hydration safety
The system SHALL handle the hydration gap when reading from the persisted session store.

#### Scenario: Store not yet hydrated
- **WHEN** a component reads from the session store before hydration completes
- **THEN** it SHALL receive safe default values (`isValid: null`) without causing SSR mismatches

#### Scenario: Hydration completes with null isValid
- **WHEN** the store finishes hydrating and `isValid` is `null`
- **THEN** the store SHALL set `isValid` to `false`

### Requirement: useFieldSession hook
The system SHALL provide a `useFieldSession` hook at `src/store/useFieldSession.ts` mirroring `useField` but bound to the session store.

#### Scenario: Hook returns value and error
- **WHEN** a component calls `useFieldSession("codeInput")`
- **THEN** it SHALL return `{ value, error, setValue, mounted }` with hydration-safe defaults

#### Scenario: Zod validation on set
- **WHEN** `setValue` is called with a value that fails the field's Zod schema
- **THEN** the hook SHALL set the error in the session store
