import * as React from "react"
import { useField } from "@/store/useField"
import { ValidatedInput } from "@/components/atoms/ValidatedInput"
import { ValidatedSelect } from "@/components/atoms/ValidatedSelect"
import { Button } from "@/components/atoms/Button"
import type { PersonSchema } from "@/store/form"

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

  if (!mounted) return null

  const people = (value as PersonSchema[]) || []

  const handleAddPerson = () => {
    const nextId = people.reduce((max, p) => Math.max(max, p._id ?? 0), 0) + 1
    const newPerson: PersonSchema & { _id: number } = {
      _id: nextId,
      helper_name: "",
      helper_relationship: "" as PersonSchema["helper_relationship"],
      helper_proximity: "" as PersonSchema["helper_proximity"],
      helper_time: "" as PersonSchema["helper_time"],
      helper_superpower: "" as PersonSchema["helper_superpower"],
    }
    setValue([...people, newPerson])
  }

  const handleRemovePerson = (index: number) => {
    const updated = [...people]
    updated.splice(index, 1)
    setValue(updated)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {people.map((person, idx) => (
          <div
            key={person._id ?? idx}
            className="p-4 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="font-semibold text-lg text-zinc-800">
                Person #{idx + 1}
              </h3>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => handleRemovePerson(idx)}
              >
                Remove
              </Button>
            </div>

            <ValidatedInput
              field={`support_circle.${idx}.helper_name`}
              label="Name"
              placeholder="e.g. John"
            />

            <ValidatedSelect
              field={`support_circle.${idx}.helper_relationship`}
              label="Relationship"
              options={relationshipOptions}
              placeholder="Select relationship"
            />

            <ValidatedSelect
              field={`support_circle.${idx}.helper_proximity`}
              label="Proximity"
              options={proximityOptions}
              placeholder="Select proximity"
            />

            <ValidatedSelect
              field={`support_circle.${idx}.helper_time`}
              label="Time Availability"
              options={timeOptions}
              placeholder="Select time availability"
            />

            <ValidatedSelect
              field={`support_circle.${idx}.helper_superpower`}
              label="Superpower"
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
          className="rounded-full px-6 py-6 border-2 border-dashed bg-transparent hover:bg-zinc-100"
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
