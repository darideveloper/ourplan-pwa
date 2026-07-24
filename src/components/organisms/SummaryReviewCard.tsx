import * as React from "react"
import { useFormStore } from "@/store/form"
import { cn } from "@/lib/utils"

export function SummaryReviewCard() {
  const state = useFormStore()

  const sections = [
    {
      title: "Core Identities",
      route: "/step1",
      data: [
        { label: "Your Name", value: state.user_name },
        { label: "Planning For", value: state.parent_name },
        { label: "Current Health", value: state.parent_health },
      ]
    },
    {
      title: "Systemic Safeguards",
      route: "/step2",
      data: [
        { label: "LPA Status", value: state.lpa_status },
        { label: "Priority Services Register", value: state.psr_status },
        { label: "Vital Documents Location", value: state.documents_loc },
      ]
    },
    {
      title: "Environment, Digital & Lifestyle",
      route: "/step3",
      data: [
        { label: "Home Type", value: state.home_type },
        { label: "OurLens Completed", value: state.ourlens_completed },
        { label: "Hazard Flags", value: state.hazard_flags?.join(", ") },
        { label: "Digital Literacy", value: state.digital_literacy },
        { label: "Pets", value: state.has_pets },
        { label: "Hobbies & Social", value: state.hobbies_social },
      ]
    }
  ]

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-primary/10 shadow-sm overflow-hidden mb-8">
      <div className="p-6 bg-primary/5 border-b border-primary/10">
        <h2 className="text-xl font-semibold text-primary">Your Plan Summary</h2>
        <p className="text-sm text-muted-foreground mt-1">Review the details you've provided before generating your plan.</p>
      </div>

      <div className="p-6 space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-medium text-foreground">{section.title}</h3>
              <a href={section.route} className="text-sm text-primary hover:underline font-medium">Edit</a>
            </div>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              {section.data.map((item) => (
                item.value ? (
                  <div key={item.label} className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">{item.label}</dt>
                    <dd className="text-sm text-foreground capitalize">{item.value.toString()}</dd>
                  </div>
                ) : null
              ))}
            </dl>
          </div>
        ))}

        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-lg font-medium text-foreground">Support Circle</h3>
            <a href="/step4" className="text-sm text-primary hover:underline font-medium">Edit</a>
          </div>
          {state.support_circle && state.support_circle.length > 0 ? (
            <ul className="space-y-3">
              {state.support_circle.map((person, i) => (
                <li key={person._id ?? i} className="flex flex-col bg-muted/30 p-3 rounded-lg border border-border">
                  <span className="font-medium text-foreground">{person.helper_name} <span className="text-muted-foreground font-normal text-sm">({person.helper_relationship})</span></span>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">Proximity</span>
                      <span className="capitalize">{person.helper_proximity.replace("_", " ")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Time</span>
                      <span className="capitalize">{person.helper_time.replace("_", " ")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Superpower</span>
                      <span className="capitalize">{person.helper_superpower}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No support circle members added.</p>
          )}
        </div>
      </div>
    </div>
  )
}
