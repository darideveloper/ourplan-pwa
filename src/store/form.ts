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

export const secondStepSchema = z.object({
  lpa_status: z.enum(["both", "one", "started", "none"], {
    required_error: "Please select an LPA status",
    invalid_type_error: "Please select a valid LPA status",
  }),
  psr_status: z.enum(["yes", "no"], {
    required_error: "Please select a PSR status",
    invalid_type_error: "Please select a valid PSR status",
  }),
  documents_loc: z.enum(["yes", "partial", "no"], {
    required_error: "Please select a documents location",
    invalid_type_error: "Please select a valid documents location",
  }),
})

export type SecondStepState = z.infer<typeof secondStepSchema>

export const thirdStepSchema = z.object({
  home_type: z.enum(["single_level", "multi_unadapted", "multi_adapted"], {
    required_error: "Please select a home type",
    invalid_type_error: "Please select a valid home type",
  }),
  ourlens_completed: z.enum(["yes", "no_but_wants", "no_dont_know"], {
    required_error: "Please indicate if an OurLens scan was completed",
    invalid_type_error: "Please select a valid option",
  }),
  hazard_flags: z.array(z.string()).min(1, "Please select at least one option"),
  digital_literacy: z.enum(["pro", "casual", "skeptic", "resistant"], {
    required_error: "Please select a digital literacy level",
    invalid_type_error: "Please select a valid option",
  }),
  has_pets: z.enum(["yes", "no"], {
    required_error: "Please select if there are any pets",
    invalid_type_error: "Please select a valid option",
  }),
  hobbies_social: z.string().min(1, "Please enter hobbies or social activities"),
})

export type ThirdStepState = z.infer<typeof thirdStepSchema>

export const personSchema = z.object({
  helper_name: z.string().min(1, "Name is required"),
  helper_relationship: z.enum(["sibling", "partner", "grandchild", "extended_family", "friend_neighbor"], {
    required_error: "Relationship is required",
    invalid_type_error: "Invalid relationship",
  }),
  helper_proximity: z.enum(["near", "mid_distance", "abroad"], {
    required_error: "Proximity is required",
    invalid_type_error: "Invalid proximity",
  }),
  helper_time: z.enum(["high", "moderate", "very_limited"], {
    required_error: "Availability is required",
    invalid_type_error: "Invalid availability",
  }),
  helper_superpower: z.enum(["admin", "fixer", "coordinator", "companion"], {
    required_error: "Superpower is required",
    invalid_type_error: "Invalid superpower",
  }),
})

export type PersonSchema = z.infer<typeof personSchema>

export const fourthStepSchema = z.object({
  support_circle: z.array(personSchema),
})

export type FourthStepState = z.infer<typeof fourthStepSchema>

export const summarySchema = z.object({
  disclaimer_agreed: z.boolean().refine(val => val === true, {
    message: "You must agree to the Terms & Disclaimer to generate your plan",
  }),
  email_recipients: z.string().optional(),
  custom_message: z.string().optional(),
})

export type SummaryStepState = z.infer<typeof summarySchema>

// FormValues is the intersection of all step schema inferred types.
// Grows as steps are added: type FormValues = FirstStepState & SecondStepState & ...
export type FormValues = FirstStepState & SecondStepState & ThirdStepState & FourthStepState & SummaryStepState

interface FormState extends Partial<FormValues> {
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
  "/step2": secondStepSchema,
  "/step3": thirdStepSchema,
  "/step4": fourthStepSchema,
  "/summary": summarySchema,
}

// --- Field → Schema Map ---
// Built at module load by inverting stepSchemas: each field name maps to its owning step schema.
// Asserts field-name uniqueness across step schemas — fails loud if a field appears in multiple steps.
export function buildFieldSchemaMap(): Map<keyof FormValues, z.ZodTypeAny> {
  const map = new Map<keyof FormValues, z.ZodTypeAny>()
  for (const [stepPath, schema] of Object.entries(stepSchemas)) {
    for (const field of Object.keys(schema.shape)) {
      const existing = map.get(field as keyof FormValues)
      if (existing) {
        // Find the competing step path for the error message
        let competingPath = ''
        for (const [otherPath, otherSchema] of Object.entries(stepSchemas)) {
          if (otherPath !== stepPath && field in otherSchema.shape) {
            competingPath = otherPath
            break
          }
        }
        throw new Error(
          `Field "${field}" appears in multiple step schemas: ${competingPath} and ${stepPath}. ` +
          `Field names must be unique across steps. Prefix with the step name (e.g. stepX_${field}).`
        )
      }
      map.set(field as keyof FormValues, schema.shape[field])
    }
  }
  return map
}

export const fieldSchemaMap = buildFieldSchemaMap()

// --- Zustand Store ---
interface FormStore extends FormState {
  errors: Record<string, string>;
  currentStep: StepPath;
  isNavigating: boolean;
  setIsNavigating: (isNavigating: boolean) => void;
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  advanceStep: (completedPath: StepPath) => string | null;
  reset: () => void;
}

export const initialState: FormState = {
  user_name: "",
  parent_name: "",
  parent_health: undefined,
  lpa_status: undefined,
  psr_status: undefined,
  documents_loc: undefined,
  home_type: undefined,
  ourlens_completed: undefined,
  hazard_flags: [],
  digital_literacy: undefined,
  has_pets: undefined,
  hobbies_social: "",
  support_circle: [],
  disclaimer_agreed: false,
  email_recipients: "",
  custom_message: "",
}

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      ...initialState,
      errors: {},
      currentStep: "",
      isNavigating: false,
      setIsNavigating: (isNavigating) => set({ isNavigating }),
      setField: (field, value) => {
        // Look up the owning schema for this field from the registry map
        const schema = fieldSchemaMap.get(field as keyof FormValues)
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
        const state = useFormStore.getState() as Record<string, unknown>;
        for (const key of Object.keys(shape)) {
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
      partialize: (state) => {
        const { isNavigating, ...rest } = state;
        return rest;
      },
    }
  )
)
