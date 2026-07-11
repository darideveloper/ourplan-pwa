import * as React from "react"
import { useField } from "@/store/useField"
import { ControlledInput } from "@/components/atoms/ControlledInput"
import { ControlledSelect } from "@/components/atoms/ControlledSelect"
import { Button } from "@/components/atoms/Button"
import type { PersonSchema, FormValues } from "@/store/form"

const relationshipOptions = [
  { label: "Sibling", value: "sibling" },
  { label: "Partner", value: "partner" },
  { label: "Grandchild", value: "grandchild" },
  { label: "Extended family", value: "extended_family" },
  { label: "Friend / Neighbour", value: "friend_neighbor" },
]

const proximityOptions = [
  { label: "Near (under 30 mins away)", value: "near" },
  { label: "Mid-distance (1+ hours away, in UK)", value: "mid_distance" },
  { label: "Abroad (internationally located / different time zone)", value: "abroad" },
]

const timeOptions = [
  { label: "High availability", value: "high" },
  { label: "Moderate availability", value: "moderate" },
  { label: "Very limited availability", value: "very_limited" },
]

const superpowerOptions = [
  { label: "The Admin/Numbers Wizard", value: "admin" },
  { label: "The Fixer", value: "fixer" },
  { label: "The Coordinator", value: "coordinator" },
  { label: "The Companion", value: "companion" },
]

export function SupportCircleRepeater() {
  const { value, error, setValue, mounted } = useField("support_circle")

  // Avoid hydration mismatch
  if (!mounted) return null

  const people = (value as PersonSchema[]) || []

  const handleAddPerson = () => {
    const newPerson: PersonSchema = {
      helper_name: "",
      helper_relationship: "" as PersonSchema["helper_relationship"],
      helper_proximity: "" as PersonSchema["helper_proximity"],
      helper_time: "" as PersonSchema["helper_time"],
      helper_superpower: "" as PersonSchema["helper_superpower"],
    }
    setValue([...people, newPerson] as FormValues["support_circle"])
  }

  const handleRemovePerson = (index: number) => {
    const updated = [...people]
    updated.splice(index, 1)
    setValue(updated as FormValues["support_circle"])
  }

  const handleChange = (index: number, field: keyof PersonSchema, val: string) => {
    const updated = [...people]
    updated[index] = { ...updated[index], [field]: val }
    setValue(updated as FormValues["support_circle"])
  }

  // If there's an array-level error, it would be passed to `error`.
  // Wait, Zod will return array-level errors if empty or items errors like "support_circle.0.helper_name".
  // Since we only get `error` for the top field ("support_circle"), nested errors aren't directly available from `useField` unless we use the full form error store. Let's just use `useFormStore` for nested errors if needed.

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {people.map((person, idx) => (
          <div
            key={person.helper_name + idx}
            className="p-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="font-semibold text-lg text-zinc-800 dark:text-zinc-100">
                Person #{idx + 1}
              </h3>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={() => handleRemovePerson(idx)}
              >
                Remove
              </Button>
            </div>

            <ControlledInput
              label="Name"
              value={person.helper_name || ""}
              onChange={(val) => handleChange(idx, "helper_name", val)}
              placeholder="e.g. John"
            />

            <ControlledSelect
              label="Relationship"
              value={person.helper_relationship || ""}
              onValueChange={(val) => handleChange(idx, "helper_relationship", val)}
              options={relationshipOptions}
              placeholder="Select relationship"
            />

            <ControlledSelect
              label="Proximity"
              value={person.helper_proximity || ""}
              onValueChange={(val) => handleChange(idx, "helper_proximity", val)}
              options={proximityOptions}
              placeholder="Select proximity"
            />

            <ControlledSelect
              label="Time Availability"
              value={person.helper_time || ""}
              onValueChange={(val) => handleChange(idx, "helper_time", val)}
              options={timeOptions}
              placeholder="Select time availability"
            />

            <ControlledSelect
              label="Superpower"
              value={person.helper_superpower || ""}
              onValueChange={(val) => handleChange(idx, "helper_superpower", val)}
              options={superpowerOptions}
              placeholder="Select superpower"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Button
          onClick={handleAddPerson}
          variant="outline"
          className="rounded-full px-6 py-6 border-2 border-dashed bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          + Add Person
        </Button>
      </div>

      {typeof error === "string" && (
        <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
