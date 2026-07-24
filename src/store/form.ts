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
  hazard_flags: z.array(z.string()),
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
  _id: z.number().optional(),
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

// --- Nested Path Utilities ---

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const segments = path.split(".")
  let current: unknown = obj
  for (const seg of segments) {
    if (current == null || typeof current !== "object") return undefined
    if (Array.isArray(current)) {
      const idx = parseInt(seg, 10)
      if (isNaN(idx) || idx < 0 || idx >= current.length) return undefined
      current = current[idx]
    } else {
      current = (current as Record<string, unknown>)[seg]
    }
  }
  return current
}

export function setNestedValue<T extends Record<string, unknown>>(obj: T, path: string, value: unknown): T {
  const segments = path.split(".")
  if (segments.length === 0) return obj

  const [first, ...rest] = segments
  if (rest.length === 0) {
    return { ...obj, [first]: value }
  }

  const isArrayIndex = /^\d+$/.test(rest[0])
  const current = (obj as Record<string, unknown>)[first]

  if (isArrayIndex) {
    const arr = Array.isArray(current) ? [...current] : []
    const idx = parseInt(rest[0], 10)
    const innerPath = rest.slice(1).join(".")
    if (innerPath) {
      arr[idx] = setNestedValue((arr[idx] ?? {}) as Record<string, unknown>, innerPath, value)
    } else {
      arr[idx] = value
    }
    return { ...obj, [first]: arr }
  }

  return {
    ...obj,
    [first]: setNestedValue(
      (current ?? {}) as Record<string, unknown>,
      rest.join("."),
      value
    )
  }
}

// --- Field → Schema Map ---
// Built at module load by inverting stepSchemas: each field name maps to its owning step schema.
// Asserts field-name uniqueness across step schemas — fails loud if a field appears in multiple steps.
export function buildFieldSchemaMap(): Map<string, z.ZodTypeAny> {
  const map = new Map<string, z.ZodTypeAny>()
  for (const [stepPath, schema] of Object.entries(stepSchemas)) {
    for (const field of Object.keys(schema.shape)) {
      const existing = map.get(field)
      if (existing) {
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
      map.set(field, schema.shape[field])
    }
  }
  return map
}

function assertNoCollision(map: Map<string, z.ZodTypeAny>, name: string, source: string): void {
  if (map.has(name)) {
    throw new Error(
      `Field "${name}" from nested schema (${source}) collides with existing entry in fieldSchemaMap. ` +
      `Nested field names must be unique across all schemas.`
    )
  }
}

export function flattenNestedSchemas(): Map<string, z.ZodTypeAny> {
  const map = new Map<string, z.ZodTypeAny>()
  for (const [, schema] of Object.entries(stepSchemas)) {
    for (const key of Object.keys(schema.shape)) {
      const fieldSchema = schema.shape[key]
      // Detect z.array() — check for .element property
      if (fieldSchema instanceof z.ZodArray) {
        const itemSchema = fieldSchema.element
        if (itemSchema instanceof z.ZodObject) {
          for (const subField of Object.keys(itemSchema.shape)) {
            assertNoCollision(map, subField, `z.array(${key}).element`)
            map.set(subField, itemSchema.shape[subField])
          }
        }
      }
    }
  }
  return map
}

export const fieldSchemaMap: Map<string, z.ZodTypeAny> = (() => {
  const map = buildFieldSchemaMap()
  const nested = flattenNestedSchemas()
  for (const [key, schema] of nested) {
    // Collision detection already ran in flattenNestedSchemas, but double-check against top-level
    if (map.has(key)) {
      throw new Error(
        `Nested field "${key}" collides with a top-level field in fieldSchemaMap. ` +
        `Field names must be unique across all schemas including nested.`
      )
    }
    map.set(key, schema)
  }
  return map
})()

// --- Value Labels for AI Enrichment ---

const enumLabels: Record<string, Record<string, string>> = {
  parent_health: {
    independent: "Independent — fully self-sufficient",
    slowing_down: "Slowing Down — needs occasional help with daily tasks",
    frail: "Frail — requires regular assistance with daily living",
    crisis: "Crisis — urgent medical or care intervention needed",
  },
  lpa_status: {
    both: "Both LPAs completed — Property & Financial Affairs and Health & Welfare",
    one: "One LPA completed",
    started: "LPA started but not yet completed",
    none: "None — no Power of Attorney has been set up",
  },
  psr_status: {
    yes: "Yes — registered on the Priority Services Register",
    no: "No — not registered on the Priority Services Register",
  },
  documents_loc: {
    yes: "Yes — all vital documents located and organised",
    partial: "Partial — some documents found, some still missing",
    no: "No — vital documents not yet located",
  },
  home_type: {
    single_level: "Single-level home — bungalow or flat",
    multi_unadapted: "Multi-storey, unadapted — stairs without modifications",
    multi_adapted: "Multi-storey, adapted — stairs with modifications (e.g., stairlift)",
  },
  ourlens_completed: {
    yes: "Yes — an OurLens home safety scan was completed",
    no_but_wants: "No, but wants one — interested in an OurLens home scan",
    no_dont_know: "No — does not want or is unsure about an OurLens scan",
  },
  digital_literacy: {
    pro: "Proficient — confident with technology and digital tools",
    casual: "Casual — comfortable with basics but not advanced features",
    skeptic: "Sceptic — reluctant to adopt new technology, prefers familiar routines",
    resistant: "Resistant — avoids technology entirely, prefers traditional methods",
  },
  has_pets: {
    yes: "Yes — there are pets in the home",
    no: "No — no pets in the home",
  },
  helper_relationship: {
    sibling: "Sibling (brother or sister)",
    partner: "Partner or spouse",
    grandchild: "Grandchild",
    extended_family: "Extended family member (cousin, aunt, uncle)",
    friend_neighbor: "Friend or neighbour",
  },
  helper_proximity: {
    near: "Lives nearby — within the same town or city",
    mid_distance: "Mid-distance — within an hour or two of travel",
    abroad: "Lives abroad — different country or time zone",
  },
  helper_time: {
    high: "High availability — can dedicate significant time to help",
    moderate: "Moderate availability — can help regularly but has own commitments",
    very_limited: "Very limited — can only help in emergencies or specific pre-arranged slots",
  },
  helper_superpower: {
    admin: "Administration — good with paperwork, forms, organising",
    fixer: "Fixer — practical, handy, good at solving physical problems",
    coordinator: "Coordinator — excellent at logistics and managing people",
    companion: "Companion — provides emotional support, company, and morale",
  },
}

const topLevelEnumFields: Array<keyof typeof enumLabels> = [
  "parent_health", "lpa_status", "psr_status", "documents_loc",
  "home_type", "ourlens_completed", "digital_literacy", "has_pets",
]

export function buildValueLabels(values: Record<string, unknown>): Record<string, unknown> {
  const labels: Record<string, unknown> = {}

  for (const field of topLevelEnumFields) {
    const value = values[field]
    const fieldLabels = enumLabels[field]
    if (value && fieldLabels && typeof value === "string") {
      labels[field] = fieldLabels[value]
    }
  }

  labels.support_circle = {
    helper_relationship: { ...enumLabels.helper_relationship },
    helper_proximity: { ...enumLabels.helper_proximity },
    helper_time: { ...enumLabels.helper_time },
    helper_superpower: { ...enumLabels.helper_superpower },
  }

  return labels
}

// --- Zustand Store ---
interface FormStore extends FormState {
  errors: Record<string, string>;
  currentStep: StepPath;
  stepValidity: Record<string, boolean>;
  isNavigating: boolean;
  setIsNavigating: (isNavigating: boolean) => void;
  setField: {
    <K extends keyof FormState>(field: K, value: FormState[K]): void;
    (field: string, value: unknown): void;
  };
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
}

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      ...initialState,
      errors: {},
      currentStep: "",
      stepValidity: {},
      isNavigating: false,
      setIsNavigating: (isNavigating) => set({ isNavigating }),
      setField: (field: string, value: unknown) => {
        const isDotted = field.includes(".")

        const schemaKey = isDotted ? field.split(".").pop()! : field
        const fieldSchema = fieldSchemaMap.get(schemaKey)

        set((state) => {
          const newErrors = { ...state.errors }

          if (fieldSchema) {
            const validation = fieldSchema.safeParse(value)
            if (!validation.success) {
              newErrors[field] = validation.error.issues?.[0]?.message || 'Invalid input'
            } else {
              delete newErrors[field]
            }
          } else {
            delete newErrors[field]
          }

          const updated = isDotted
            ? setNestedValue(state as Record<string, unknown>, field, value)
            : { ...state, [field]: value }

          // Compute step validity for the current page
          const currentPath = window.location.pathname
          const stepSchema = stepSchemas[currentPath]
          let stepValidity = { ...state.stepValidity }
          if (stepSchema) {
            const data: Record<string, unknown> = {}
            const shape = stepSchema.shape as Record<string, z.ZodTypeAny>
            for (const key of Object.keys(shape)) {
              data[key] = updated[key as keyof typeof updated] ?? state[key as keyof typeof state]
            }
            stepValidity[currentPath] = stepSchema.safeParse(data).success
          }

          return { ...updated, errors: newErrors, stepValidity }
        })
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
            // Also clear nested errors (e.g. support_circle.0.helper_name)
            for (const errKey of Object.keys(newErrors)) {
              if (errKey.startsWith(key + ".")) {
                delete newErrors[errKey];
              }
            }
          }
          return { ...state, currentStep: completedPath, errors: newErrors };
        });

        return getNextStep(completedPath);
      },
      reset: () => set({ ...initialState, errors: {}, currentStep: "", stepValidity: {} }),
    }),
    {
      name: 'ourplan-form-storage',
      partialize: (state) => {
        const { isNavigating, errors: _errors, ...rest } = state;
        return rest;
      },
    }
  )
)

if (typeof window !== "undefined") {
  useFormStore.subscribe((state) => console.log("FormStore:", state))
}
