## ADDED Requirements

### Requirement: Atoms bind to a single store field via the `useField` hook

Every validated atom (`ValidatedInput`, `ValidatedRadioGroup`, and future atoms following the same pattern) SHALL obtain its field state by calling `useField(field)` with a single `field` argument of type `keyof FormValues`. Atoms SHALL NOT import `useFormStore` directly, SHALL NOT re-implement the hydration `mounted` gate, and SHALL NOT duplicate store selector calls.

#### Scenario: Atom reads its value and error from the store
- **WHEN** an atom renders with `field="user_name"`
- **THEN** the atom's displayed value reflects `useFormStore(state => state.user_name)` and its error display reflects `useFormStore(state => state.errors.user_name)`

#### Scenario: Atom writes via the hook's setValue
- **WHEN** the user types into `ValidatedInput field="user_name"`
- **THEN** the atom calls `setValue(e.target.value)` exposed by `useField` (with `field` captured in the hook's closure), which delegates to `useFormStore.getState().setField("user_name", value)`

#### Scenario: Atom does not import the store
- **WHEN** a developer inspects an atom's source file
- **THEN** there is no `import { useFormStore }` and no `useFormStore(...)` call; all store access flows through `useField`

### Requirement: `useField` owns the hydration gate

The `useField` hook SHALL expose a `mounted: boolean` flag that starts `false` on initial render and becomes `true` after the first client-side effect runs. The hook SHALL return the field's real `value` only when `mounted` is `true`; before mount, it SHALL return the field's initial/empty value so that server-rendered HTML and the first client render match.

#### Scenario: Before hydration, atom renders with empty value
- **WHEN** an atom renders server-side or during the first client render before `useEffect` fires
- **THEN** the value passed to the underlying shadcn input is `""` (for string fields) and `mounted` is `false`

#### Scenario: After hydration, atom renders the stored value
- **WHEN** the first client-side `useEffect` runs
- **THEN** `mounted` becomes `true`, the hook returns the actual stored value, and the atom re-renders with the persisted input populated

### Requirement: Atoms accept static config as props and stay generic

Each atom SHALL accept its static configuration (label, placeholder, options, etc.) as props from the calling `.astro` page. Atoms SHALL be generic over all `FormValues` keys — the `field` prop SHALL be typed as `keyof FormValues`, not `keyof FirstStepState`. No atom SHALL hardcode a specific step's field name, option list, or label text.

#### Scenario: Page supplies static config
- **WHEN** `step1.astro` renders `<ValidatedInput field="user_name" label="First, what is your name?" placeholder="e.g., Sarah" client:load />`
- **THEN** the atom displays that label and placeholder without any step-1-specific logic inside the atom

#### Scenario: Atom accepts any FormValues field
- **WHEN** a future step renders `<ValidatedInput field="some_step4_field" label="..." client:load />` after `some_step4_field` is added to `FormValues`
- **THEN** the atom typechecks and renders without modification

### Requirement: Atoms accept only serializable props

Each atom SHALL accept only JSON-serializable props (strings, numbers, booleans, arrays, plain objects). Atoms SHALL NOT accept function props (e.g. `labelFn`, `renderFn`, `onChange` callbacks beyond native DOM events). This constraint is enforced by Astro's `client:load` prop serialization boundary — functions cannot be passed from `.astro` pages to client-side React islands.

#### Scenario: Atom props are serializable
- **WHEN** a developer inspects `ValidatedInputProps` or `ValidatedRadioGroupProps`
- **THEN** every prop is a JSON-serializable type (string, number, boolean, array, plain object); no prop is typed as a function

#### Scenario: Static label used for all atom labels
- **WHEN** an atom renders with `label="How are you?"`
- **THEN** the label text is `How are you?` — the label is always a static string, never derived from a function

### Requirement: `DynamicLabelRadioGroup` molecule provides store-derived labels

A reusable molecule `DynamicLabelRadioGroup` (`src/components/molecules/DynamicLabelRadioGroup.tsx`) SHALL wrap `ValidatedRadioGroup` for cases where the label must interpolate values from other store fields. The molecule SHALL accept serializable props: `field` (which field to bind), `options` (radio options array), `labelTemplate` (string with `{field_name}` placeholders), `labelFields` (array of `keyof FormValues` field names to interpolate), and `fallbackLabel` (the full label string used when any listed field is empty). The molecule SHALL subscribe to the listed store fields (via `useShallow` to avoid infinite re-renders), build the label string by replacing `{field_name}` placeholders with stored values when all listed fields are present, or use `fallbackLabel` when any listed field is empty. The result is passed as the static `label` prop to `ValidatedRadioGroup`. The molecule SHALL handle its own hydration gate for the label (use `fallbackLabel` before `mounted` is `true`).

#### Scenario: Dynamic label interpolates store values
- **WHEN** `DynamicLabelRadioGroup` renders with `labelTemplate="How would you describe {parent_name}'s current health?"`, `labelFields={["parent_name"]}`, `fallbackLabel="How would you describe their current health?"`, and the store's `parent_name` is `"Mum"`
- **THEN** after `mounted` is `true`, the rendered label reads `How would you describe Mum's current health?`

#### Scenario: Dynamic label fallback is grammatically correct
- **WHEN** `labelFields` includes `parent_name` and `parent_name` is empty
- **THEN** the `fallbackLabel` is used directly, producing `How would you describe their current health?` — no `"their's"` or dangling `'s`

#### Scenario: Molecule is reusable across fields
- **WHEN** a different step uses `DynamicLabelRadioGroup` with `labelTemplate="What matters most to {child_name}?"`, `labelFields={["child_name"]}`, `fallbackLabel="What matters most to them?"`
- **THEN** the molecule renders correctly with the different template and fields, without any code change to the molecule itself

#### Scenario: Molecule does not evaluate template before hydration
- **WHEN** the molecule renders server-side or before the first client effect
- **THEN** the template is not evaluated against store values; the `fallbackLabel` is used so that server and first-client render match

#### Scenario: Molecule accepts only serializable props
- **WHEN** a developer inspects `DynamicLabelRadioGroupProps`
- **THEN** every prop is a JSON-serializable type; no prop is a function

### Requirement: Replacing `ParentHealthRadioGroup` with `DynamicLabelRadioGroup`

The file `src/components/molecules/ParentHealthRadioGroup.tsx` SHALL be deleted. It SHALL be replaced by `src/components/molecules/DynamicLabelRadioGroup.tsx` — a reusable, parameterized molecule. `src/pages/step1.astro` SHALL import `DynamicLabelRadioGroup` and pass serializable props: `field="parent_health"`, the four health options, `labelTemplate`, `labelFields`, and `fallbackLabel`.

#### Scenario: step1 renders the radio group via the reusable molecule
- **WHEN** `step1.astro` renders
- **THEN** it imports `DynamicLabelRadioGroup` from `@/components/molecules/DynamicLabelRadioGroup` and passes `field="parent_health"`, the four health options, `labelTemplate="How would you describe {parent_name}'s current health?"`, `labelFields={["parent_name"]}`, and `fallbackLabel="How would you describe their current health?"`; no `ParentHealthRadioGroup` is imported

#### Scenario: Old molecule file is gone
- **WHEN** a developer looks for `src/components/molecules/ParentHealthRadioGroup.tsx`
- **THEN** the file does not exist

#### Scenario: New molecule file exists
- **WHEN** a developer looks for `src/components/molecules/DynamicLabelRadioGroup.tsx`
- **THEN** the file exists and exports a reusable, parameterized component
