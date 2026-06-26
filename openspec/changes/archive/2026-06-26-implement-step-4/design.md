## Context

Step 4 introduces a dynamic array state (`support_circle`) that holds zero to many objects representing members of a user's support circle. The UI needs to render a repeater block for this data, along with specific dropdown inputs for attributes like relationship, proximity, time availability, and superpower.

## Goals / Non-Goals

**Goals:**
- Implement a reusable, dynamic repeater UI component (`SupportCircleRepeater`) that correctly modifies an array in the Zustand state.
- Introduce a new Select/Dropdown component (`ValidatedSelect`) compatible with `shadcn` and our existing validation store.
- Complete Step 4's form layout and functionality.

**Non-Goals:**
- Complete implementation of the entire Summary page (we will just set up the disclaimer foundation here or leave it for the summary step if deemed out of scope for Step 4's immediate layout).

## Decisions

- **State Management:** We will use Zustand's array operations (`setField('support_circle', newArray)`) to add, update, and remove items from the `support_circle` array.
- **Form Components:** Create `ValidatedSelect` (wrapping shadcn's Select) to provide dropdown interfaces. We will also create a `SupportCircleRepeater` component that loops through the array and renders a card for each helper.

## Risks / Trade-offs

- **State Sync in Repeater:** Managing updates inside an array of objects requires careful immutable updates. → Mitigation: We will handle updates cleanly by mapping the array by index and replacing the specific field value.
