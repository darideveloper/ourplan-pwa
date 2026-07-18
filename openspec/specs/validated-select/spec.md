# validated-select

## Purpose

Provides a `ValidatedSelect` component that wraps the shadcn `Select` primitive with Zustand store binding via `useField`. This mirrors the pattern of `ValidatedInput` and `ValidatedRadioGroup`, enabling consistent validation, error display, and hydration safety for select fields.

## Requirements

### Requirement: ValidatedSelect binds to Zustand store via useField

A `ValidatedSelect` component SHALL exist in `src/components/atoms/` that wraps the shadcn `Select` primitive with store binding. It SHALL accept a `field` prop (`keyof FormValues | string` — widened to accept dotted paths), a `label` string, an `options` array of `{ value: string, label: string }`, and an optional `placeholder`. It SHALL use `useField(field)` for all state access and SHALL display the error message when validation fails.

#### Scenario: ValidatedSelect renders with label and options

- **WHEN** `<ValidatedSelect field="psr_status" label="PSR Status" options={[...]} />` is rendered
- **THEN** it SHALL display the label, a `SelectTrigger`, and the options as `SelectItem` children
- **THEN** the currently selected value SHALL be read from `useField("psr_status").value`

#### Scenario: ValidatedSelect shows error

- **WHEN** `useField("psr_status").error` returns `"Please select a PSR status"`
- **THEN** the component SHALL display the error message and SHALL apply error styling to the trigger

#### Scenario: ValidatedSelect updates store on selection

- **WHEN** the user selects an option
- **THEN** `useField("psr_status").setValue` SHALL be called with the selected value
