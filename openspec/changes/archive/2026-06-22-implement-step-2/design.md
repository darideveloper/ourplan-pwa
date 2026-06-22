## Context

We are implementing "Step 2: Systemic Safeguards" of the OurPlan form. The step is currently a placeholder page at `/step2`. The `form-screens` spec defines three fields for this page: `lpa_status`, `psr_status`, and `documents_loc`. All three are radio button fields. We have an existing `ValidatedRadioGroup` atom component that handles Zustand state binding and validation feedback.

## Goals / Non-Goals

**Goals:**
- Render Step 2 UI strictly matching the defined options in the `form-screens` spec.
- Extend the Zustand form store (`src/store/form.ts`) to validate and store these three fields.
- Ensure validation blocks progression to Step 3 until all fields are answered.
- Maintain visual consistency using `StepLayout`.

**Non-Goals:**
- We are not modifying Step 3, Step 4, or Summary pages.
- We are not adding backend integration yet (that happens on Summary).

## Decisions

1. **Use `ValidatedRadioGroup`:** We will reuse `ValidatedRadioGroup` for all three fields since they are simple enum selections.
2. **State Store Schema:** We will add `secondStepSchema` to `src/store/form.ts`. It will use `z.enum([...])` for the three fields based on the options defined in the spec.
3. **FormState Type:** The `FormState` interface will be extended with `lpa_status`, `psr_status`, and `documents_loc` properties. We will use the Zod schema inference `z.infer<typeof secondStepSchema>` or define the types manually to match the store's current pattern.

## Risks / Trade-offs

- **Risk:** Typo in enum values causing validation errors or state mismatch.
  - **Mitigation:** Strictly copy the enum keys from the spec (`both`, `one`, `started`, `none` for LPA; `yes`, `no` for PSR; `yes`, `partial`, `no` for documents).
