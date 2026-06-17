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

// --- Zustand Store ---
interface FormStore extends FormState {
  errors: Record<string, string>;
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
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
      reset: () => set({ ...initialState, errors: {} }),
    }),
    {
      name: 'ourplan-form-storage',
    }
  )
)
