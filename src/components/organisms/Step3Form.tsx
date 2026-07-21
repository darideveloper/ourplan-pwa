import * as React from "react"
import { useFormStore } from "@/store/form"
import { ValidatedRadioGroup } from "@/components/atoms/ValidatedRadioGroup"
import { ValidatedCheckboxGroup } from "@/components/atoms/ValidatedCheckboxGroup"
import { ValidatedInput } from "@/components/atoms/ValidatedInput"

const homeTypeOptions = [
  { value: "single_level", label: "Flat, bungalow, or park home (no stairs)" },
  { value: "multi_unadapted", label: "House with stairs (no current modifications)" },
  { value: "multi_adapted", label: "House with stairs (already has a stairlift, rails, etc.)" },
]

const ourlensCompletedOptions = [
  { value: "yes", label: "Yes, we've completed the AI hazard scan" },
  { value: "no_but_wants", label: "Not yet, but I want to do one" },
  { value: "no_dont_know", label: "No, I\u2019m not sure what this is or how it works" },
]

const hazardFlagsYesOptions = [
  { value: "slip", label: "Slip Hazards (Bathroom layout, high shower steps, slick tiling)" },
  { value: "trip", label: "Trip Hazards (Loose rugs, frayed carpets, trailing cords)" },
  { value: "light", label: "Visibility Issues (Dark hallways, steep stairwells, poor landing lights)" },
  { value: "access", label: "Structural/Access (Narrow doorways, heavy doors, split-level steps)" },
]

const hazardFlagsNoOptions = [
  { value: "stairs", label: "Managing the stairs safely" },
  { value: "bathing", label: "Navigating the bathroom (getting in/out of the bath/shower)" },
  { value: "clutter", label: "General clutter, low lighting, or uneven flooring thresholds" },
  { value: "entry", label: "Getting into the house safely (steep external steps or heavy thresholds)" },
]

const digitalLiteracyOptions = [
  { value: "pro", label: "Very confident (shops online, uses video calls, manages apps)" },
  { value: "casual", label: "Uses basic features (WhatsApp/texts) but gets anxious with admin, updates, or passwords" },
  { value: "skeptic", label: "Basic mobile for calls only, completely offline" },
  { value: "resistant", label: "Actively dislikes technology and refuses to use it" },
]

const hasPetsOptions = [
  { value: "yes", label: "Yes, they have a pet(s)" },
  { value: "no", label: "No pets" },
]

export function Step3Form() {
  const ourlensCompleted = useFormStore(state => state.ourlens_completed)
  const parentName = useFormStore(state => state.parent_name)
  const setField = useFormStore(state => state.setField)
  const prevOurlensRef = React.useRef<string | undefined>(undefined)

  React.useEffect(() => {
    if (prevOurlensRef.current !== undefined && prevOurlensRef.current !== ourlensCompleted) {
      setField("hazard_flags", [])
    }
    prevOurlensRef.current = ourlensCompleted
  }, [ourlensCompleted, setField])

  const nameOrLovedOne = parentName || "your loved one"
  const namePossessive = parentName ? `${parentName}'s` : "their"

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
      <ValidatedRadioGroup
        field="home_type"
        label={`What type of home does ${nameOrLovedOne} live in?`}
        options={homeTypeOptions}
      />

      <ValidatedRadioGroup
        field="ourlens_completed"
        label={`Have you completed an OurLens Home Safety Scan for ${namePossessive} home yet?`}
        options={ourlensCompletedOptions}
      />

      {ourlensCompleted === "yes" && (
        <ValidatedCheckboxGroup
          field="hazard_flags"
          label="What did your OurLens scan flag as the highest risk areas?"
          options={hazardFlagsYesOptions}
        />
      )}

      {(ourlensCompleted === "no_but_wants" || ourlensCompleted === "no_dont_know") && (
        <ValidatedCheckboxGroup
          field="hazard_flags"
          label="Based on your last visit, what are your biggest worries about their physical living space?"
          options={hazardFlagsNoOptions}
        />
      )}

      <ValidatedRadioGroup
        field="digital_literacy"
        label={`How confident is ${nameOrLovedOne} with digital technology?`}
        options={digitalLiteracyOptions}
      />

      <ValidatedRadioGroup
        field="has_pets"
        label={`Does ${nameOrLovedOne} have any pets that they adore?`}
        options={hasPetsOptions}
      />

      <ValidatedInput
        field="hobbies_social"
        label={`What are ${namePossessive} favourite hobbies or main sources of social interaction right now?`}
        placeholder="e.g., gardening, church, lunch club, watching football, family visits"
      />
    </div>
  )
}
