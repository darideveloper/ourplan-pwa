import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { z } from 'zod'

// --- Zod Schemas ---
export const firstStepSchema = z.object({
  user_name: z.string().min(1, "Your name is required"),
  parent_name: z.string().min(1, "Parent's name is required"),
  parent_health: z.enum(["independent", "slowing_down", "frail", "crisis"], {
    required_error: "Please select a health status",
    invalid_type_error: "Please select a valid health status",
  }),
})

export type FirstStepState = z.infer<typeof firstStepSchema>

interface FormState extends Partial<FirstStepState> {
  // We can add more step states here later
}

// --- Step Progress Types ---
export type StepPath = "" | "/step1" | "/step2" | "/step3" | "/step4" | "/summary"

export const STEP_ORDER: readonly StepPath[] = ["/step1", "/step2", "/step3", "/step4", "/summary"] as const

export function getStepIndex(path: string): number {
  return STEP_ORDER.indexOf(path as StepPath)
}

export function getNextStep(current: string): string | null {
  const idx = getStepIndex(current)
  if (idx < 0 || idx >= STEP_ORDER.length - 1) return null
  return STEP_ORDER[idx + 1]
}

export function getEarliestIncomplete(completed: string): string {
  const idx = getStepIndex(completed)
  if (idx < 0) return STEP_ORDER[0]
  const nextIdx = idx + 1
  return nextIdx < STEP_ORDER.length ? STEP_ORDER[nextIdx] : STEP_ORDER[STEP_ORDER.length - 1]
}

// --- Step Schema Registry ---
export const stepSchemas: Record<string, z.ZodObject<any>> = {
  "/step1": firstStepSchema,
}

// --- Zustand Store ---
interface FormStore extends FormState {
  errors: Record<string, string>;
  currentStep: StepPath;
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  advanceStep: (completedPath: StepPath) => string | null;
  reset: () => void;
}

const initialState: FormState = {
  user_name: "",
  parent_name: "",
  parent_health: undefined,
}

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      ...initialState,
      errors: {},
      currentStep: "",
      setField: (field, value) => {
        // Validate individual field against its schema shape
        const schema = firstStepSchema.shape[field as keyof typeof firstStepSchema.shape];
        if (schema) {
          const validation = schema.safeParse(value);
          if (!validation.success) {
            const errorMsg = validation.error.issues?.[0]?.message || 'Invalid input';
            set((state) => ({
              ...state,
              [field]: value,
              errors: { ...state.errors, [field]: errorMsg }
            }));
            return;
          }
        }

        // If valid or no schema, clear error and update value
        set((state) => {
          const newErrors = { ...state.errors };
          delete newErrors[field];
          return { ...state, [field]: value, errors: newErrors };
        });
      },
      advanceStep: (completedPath) => {
        const schema = stepSchemas[completedPath]

        // If no schema registered (placeholder step), advance without validation
        if (!schema) {
          set((state) => ({ ...state, currentStep: completedPath }))
          return getNextStep(completedPath)
        }

        // Build data object from store for the completed step
        const data: Record<string, unknown> = {};
        const shape = schema.shape as Record<string, z.ZodTypeAny>;
        for (const key of Object.keys(shape)) {
          const state = useFormStore.getState() as Record<string, unknown>;
          data[key] = state[key];
        }

        const validation = schema.safeParse(data);
        if (!validation.success) {
          const errors: Record<string, string> = {};
          for (const issue of validation.error.issues) {
            const path = issue.path.join(".");
            if (path) errors[path] = issue.message;
          }
          set((state) => ({ ...state, errors: { ...state.errors, ...errors } }));
          return null;
        }

        // Clear errors for this step on success
        set((state) => {
          const newErrors = { ...state.errors };
          const shapeKeys = Object.keys(shape);
          for (const key of shapeKeys) {
            delete newErrors[key];
          }
          return { ...state, currentStep: completedPath, errors: newErrors };
        });

        return getNextStep(completedPath);
      },
      reset: () => set({ ...initialState, errors: {}, currentStep: "" }),
    }),
    {
      name: 'ourplan-form-storage',
    }
  )
)
