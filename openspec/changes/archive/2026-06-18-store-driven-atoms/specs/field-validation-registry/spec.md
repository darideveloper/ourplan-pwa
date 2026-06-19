## ADDED Requirements

### Requirement: `FormValues` is the intersection of all step schema types

The store SHALL export a `FormValues` type defined as the intersection of all step schema inferred types: `type FormValues = FirstStepState & SecondStepState & ...` (growing as steps are added). Today it equals `FirstStepState`. This intersection type SHALL stay automatically in sync with Zod schemas — adding a field to a step schema automatically adds it to `FormValues`. `FormValues` SHALL be a superset of `FirstStepState` so that existing localStorage data loads cleanly. `FormStore` SHALL extend `Partial<FormValues>` rather than `Partial<FirstStepState>`.

#### Scenario: Existing localStorage loads after the change
- **WHEN** a user with existing `ourplan-form-storage` localStorage (containing `user_name`, `parent_name`, `parent_health`, `errors`, `currentStep`) loads the app after this change ships
- **THEN** the store hydrates with their saved values without data migration and without errors

#### Scenario: New step fields can be added without touching atoms
- **WHEN** a developer adds `step2_field` to `FormValues` and registers a step-2 Zod schema in `stepSchemas`
- **THEN** `<ValidatedInput field="step2_field" ... />` typechecks and renders without any change to the atom

### Requirement: `setField` resolves the owning schema via a `field → schema` map

The store SHALL build a `fieldSchemaMap: Map<keyof FormValues, ZodTypeAny>` at module load by iterating `stepSchemas` and mapping each field name to its owning step's schema. `setField(field, value)` SHALL look up `fieldSchemaMap.get(field)` and validate `value` against that schema's `.shape[field]`. `setField` SHALL NOT reference `firstStepSchema` directly. If a field is not present in any registered schema, `setField` SHALL set the value without validation (matching current behaviour for un-schema'd fields).

#### Scenario: Step 1 field validates against the step 1 schema
- **WHEN** `setField("user_name", "")` is called
- **THEN** the lookup resolves to `firstStepSchema`, validation runs against `firstStepSchema.shape.user_name`, and the error `Your name is required` is stored in `errors.user_name`

#### Scenario: Step 2 field validates against the step 2 schema
- **WHEN** a step-2 schema is registered in `stepSchemas` with a `step2_field` key, and `setField("step2_field", <invalid>)` is called
- **THEN** the lookup resolves to the step-2 schema and validation runs against that schema's `.shape.step2_field`, storing the resulting error in `errors.step2_field`

#### Scenario: Unregistered field sets without validation
- **WHEN** `setField("some_future_field", "x")` is called and `some_future_field` is not in any registered schema
- **THEN** the value is stored and no error is recorded for that field

#### Scenario: No hardcoded reference to firstStepSchema in setField
- **WHEN** a developer inspects `setField`'s implementation
- **THEN** there is no `firstStepSchema` reference; all schema lookups go through `fieldSchemaMap`

### Requirement: `fieldSchemaMap` asserts field-name uniqueness across step schemas

At module load, while building `fieldSchemaMap`, the store SHALL assert that no field name appears in more than one step schema. If a collision is detected, the build SHALL fail loud (throw at module load with a message naming the colliding field and the competing schemas) rather than silently keeping one schema over another.

#### Scenario: Unique field names build successfully
- **WHEN** `stepSchemas` contains step-1 and step-2 schemas with disjoint field names
- **THEN** `fieldSchemaMap` is built without throwing and maps each field to its single owning schema

#### Scenario: Colliding field names fail loud
- **WHEN** `stepSchemas` contains two schemas that both define a field named `notes`
- **THEN** module load throws an error naming `notes` and the two competing step paths, and the app does not silently pick one schema

### Requirement: Existing `advanceStep`, `reset`, and `stepSchemas` registry behaviour is preserved

The `stepSchemas` registry SHALL remain the single source of truth for per-step schemas. `advanceStep` SHALL continue to look up the full step schema from `stepSchemas` and validate the step's data object as a whole. `reset` SHALL continue to clear state to `initialState`. No observable behaviour of `advanceStep` or `reset` SHALL change.

#### Scenario: advanceStep validates a full step
- **WHEN** `advanceStep("/step1")` is called with a store containing an empty `user_name`
- **THEN** validation against `stepSchemas["/step1"]` fails, `errors.user_name` is set, and `advanceStep` returns `null` (matching current behaviour)

#### Scenario: reset clears state
- **WHEN** `reset()` is called
- **THEN** the store returns to `initialState` with `errors: {}` and `currentStep: ""` (matching current behaviour)
