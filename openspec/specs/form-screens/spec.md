# form-screens

## Purpose

Defines the complete multi-step conversational form: every screen, every field, field types, options, conditional logic, and validation rules. This is the single source of truth for what the OurPlan form wizard captures — from collecting identities through to generating the final plan PDF.

---

## Screen Flow (Navigation Map)

```
    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
    │  STEP 1  │ ──> │  STEP 2  │ ──> │  STEP 3  │ ──> │  STEP 4  │ ──> │ SUMMARY  │
    │  Core    │     │ Systemic │     │ Environ. │     │ Support  │     │ Review & │
    │Identities│     │Safeguards│     │ Digital  │     │  Circle  │     │ Submit   │
    │          │     │          │     │  & Life  │     │(repeater)│     │          │
    └──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
    Route: /step1    Route: /step2    Route: /step3    Route: /step4   Route: /summary

    ┌──────────┐
    │  WELCOME │
    │   / or   │  ResumeRedirect -> earliest incomplete step
    │  /step1  │
    └──────────┘
```

```
STATE PERSISTENCE:
  ┌───────────────────────────────────────────────────────────┐
  │  Zustand store (src/store/form.ts) + localStorage          │
  │  ┌──────────────┐  ┌──────────────┐     ┌──────────────┐  │
  │  │ form fields  │  │ currentStep  │     │   errors     │  │
  │  │  (all steps) │  │  (StepPath)  │     │ (per-field)  │  │
  │  └──────────────┘  └──────────────┘     └──────────────┘  │
  └───────────────────────────────────────────────────────────┘
```

---

## Screen 1: Core Identities

**Route:** `/step1`  
**Page:** `src/pages/step1.astro`  
**Status:** IMPLEMENTED  
**Schema:** `firstStepSchema` in `src/store/form.ts:6`  
**Title:** "Core Identities"  
**Subtitle:** "Let's start with some basic information so we can personalise your plan beautifully."

```
┌─────────────────────────────────────────────────┐
│  STEP 1: Core Identities                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  user_name           [text input           ]    │
│  (label: "First, what is your name?")           │
│  (placeholder: "e.g., Sarah")                   │
│  (validation: min 1 char)                       │
│                                                 │
│  parent_name         [text input           ]    │
│  (label: "Who are we planning for today?")      │
│  (placeholder: "e.g., Mum, Dad, John & Rita")   │
│  (validation: min 1 char)                       │
│                                                 │
│  parent_health       (o) independent            │
│  (label: "How would  (o) slowing_down           │
│   you describe        (o) frail                 │
│   [Name]'s current    (o) crisis                │
│   health?")                                     │
│  (validation: required enum)                    │
│                                                 │
│                  [ Continue -> Step 2 ]          │
└─────────────────────────────────────────────────┘
```

### Fields

| # | Key | Type | Question | Options | Component |
|---|-----|------|----------|---------|-----------|
| 1 | `user_name` | text | "First, what is your name?" | — | `ValidatedInput` |
| 2 | `parent_name` | text | "Who are we planning for today?" | — | `ValidatedInput` |
| 3 | `parent_health` | radio | "How would you describe [Name]'s current health?" | `independent`, `slowing_down`, `frail`, `crisis` | `ParentHealthRadioGroup` |

### Options Detail: `parent_health`

| Value | Label |
|-------|-------|
| `independent` | Doing great, completely independent |
| `slowing_down` | Managing fine, but starting to slow down |
| `frail` | Facing noticeable physical or cognitive challenges |
| `crisis` | In a bit of a health crisis right now |

---

## Screen 2: Systemic Safeguards

**Route:** `/step2`  
**Page:** `src/pages/step2.astro`  
**Status:** PLACEHOLDER (no fields implemented)  
**Schema:** NOT YET DEFINED (needs `secondStepSchema`)  
**Title:** "Systemic Safeguards"  
**Subtitle:** "Help us understand what safeguards matter most."

```
┌─────────────────────────────────────────────────┐
│  STEP 2: Systemic Safeguards                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  lpa_status           (o) both                  │
│  (label: "Do you have  (o) one                  │
│   Lasting Power of     (o) started              │
│   Attorney registered  (o) none                 │
│   for [Name]?")                                 │
│  (validation: required enum)                    │
│                                                 │
│  psr_status           (o) yes                   │
│  (label: "Is [Name]    (o) no                   │
│   registered on the                             │
│   utility Priority                              │
│   Services Register?")                          │
│  (validation: required enum)                    │
│                                                 │
│  documents_loc        (o) yes                   │
│  (label: "Do you know  (o) partial              │
│   where [Name] keeps   (o) no                   │
│   vital documents?")                            │
│  (validation: required enum)                    │
│                                                 │
│                  [ Continue -> Step 3 ]          │
└─────────────────────────────────────────────────┘
```

### Fields

| # | Key | Type | Question | Options | Component |
|---|-----|------|----------|---------|-----------|
| 4 | `lpa_status` | radio | "Do you have Lasting Power of Attorney (LPA) registered for [Name]?" | `both`, `one`, `started`, `none` | `ValidatedRadioGroup` |
| 5 | `psr_status` | radio | "Is [Name] registered on the utility Priority Services Register (PSR)?" | `yes`, `no` | `ValidatedRadioGroup` |
| 6 | `documents_loc` | radio | "If there was an emergency tomorrow, do you know exactly where [Name] keeps their vital documents (Will, NHS number, insurance)?" | `yes`, `partial`, `no` | `ValidatedRadioGroup` |

### Options Detail: `lpa_status`

| Value | Label |
|-------|-------|
| `both` | Yes, both Health & Welfare and Financial |
| `one` | Just one of them (either Health or Financial) |
| `started` | We've talked about it, but nothing is legally active yet |
| `none` | No, and I don't know how to bring it up |

### Options Detail: `psr_status`

| Value | Label |
|-------|-------|
| `yes` | Yes, all sorted |
| `no` | No, or I haven't heard of this yet |

### Options Detail: `documents_loc`

| Value | Label |
|-------|-------|
| `yes` | Yes, I know exactly where the folder/drawer is |
| `partial` | I have a rough idea, but it would take some hunting |
| `no` | No clue — it's a complete mystery |

---

## Screen 3: Environment, Digital & Lifestyle

**Route:** `/step3`  
**Page:** `src/pages/step3.astro`  
**Status:** PLACEHOLDER (no fields implemented)  
**Schema:** NOT YET DEFINED (needs `thirdStepSchema`)  
**Title:** "Future Planning" *(title may need updating from PSD)*  
**Subtitle:** "Help us understand your wishes for the future." *(subtitle may need updating)*

```
┌─────────────────────────────────────────────────┐
│  STEP 3: Environment, Digital & Lifestyle       │
├─────────────────────────────────────────────────┤
│                                                 │
│  home_type            (o) single_level          │
│  (label: "What type    (o) multi_unadapted      │
│   of home does         (o) multi_adapted        │
│   [Name] live in?")                             │
│                                                 │
│  ourlens_completed    (o) yes                   │
│  (label: "Have you     (o) no_but_wants         │
│   completed an         (o) no_dont_know         │
│   OurLens Home                                  │
│   Safety Scan?")                                │
│                                                 │
│  ── CONDITIONAL BLOCK ──                       │
│  (if ourlens_completed == yes)                  │
│  hazard_flags (checkboxes)                      │
│  (label: "What did your scan flag as            │
│   the highest risk areas?")                     │
│  [x] slip  [x] trip  [x] light  [x] access     │
│                                                 │
│  (if ourlens_completed == no_but_wants          │
│      || no_dont_know)                           │
│  hazard_flags (checkboxes)                      │
│  (label: "What are your biggest                 │
│   worries about their living space?")           │
│  [x] stairs  [x] bathing                       │
│  [x] clutter  [x] entry                        │
│                                                 │
│  digital_literacy     (o) pro                   │
│  (label: "How          (o) casual               │
│   confident is         (o) skeptic              │
│   [Name] with digital  (o) resistant            │
│   technology?")                                 │
│                                                 │
│  has_pets             (o) yes                   │
│  (label: "Does         (o) no                   │
│   [Name] have any                               │
│   pets?")                                       │
│                                                 │
│  hobbies_social       [text/tags input     ]    │
│  (label: "What are                              │
│   [Name]'s favourite                            │
│   hobbies or main                               │
│   sources of social                             │
│   interaction?")                                │
│  (placeholder: "e.g., gardening, church,        │
│   lunch club")                                  │
│                                                 │
│                  [ Continue -> Step 4 ]          │
└─────────────────────────────────────────────────┘
```

### Fields

| # | Key | Type | Question | Options | Component |
|---|-----|------|----------|---------|-----------|
| 7 | `home_type` | radio | "What type of home does [Name] live in?" | `single_level`, `multi_unadapted`, `multi_adapted` | `ValidatedRadioGroup` |
| 8a | `ourlens_completed` | radio | "Have you completed an OurLens Home Safety Scan for [Name]'s home yet?" | `yes`, `no_but_wants`, `no_dont_know` | `ValidatedRadioGroup` |
| 8b | `hazard_flags` | checkboxes **(conditional)** | *See below* | *See below* | `ValidatedCheckboxGroup` |

### Field 8b: Conditional Logic

**TRIGGER:** value of `ourlens_completed` (field 8a)

| When `ourlens_completed` = | Question | Options |
|---|---|---|
| `yes` | "What did your OurLens scan flag as the highest risk areas?" | `slip`, `trip`, `light`, `access` |
| `no_but_wants` or `no_dont_know` | "Based on your last visit, what are your biggest worries about their physical living space?" | `stairs`, `bathing`, `clutter`, `entry` |

### Options Detail: `home_type`

| Value | Label |
|-------|-------|
| `single_level` | Flat, bungalow, or park home (no stairs) |
| `multi_unadapted` | House with stairs (no current modifications) |
| `multi_adapted` | House with stairs (already has a stairlift, rails, etc.) |

### Options Detail: `ourlens_completed`

| Value | Label |
|-------|-------|
| `yes` | Yes, we've completed the AI hazard scan |
| `no_but_wants` | Not yet, but I want to do one |
| `no_dont_know` | No, I'm not sure what this is or how it works |

### Options Detail: `hazard_flags` (yes branch)

| Value | Label |
|-------|-------|
| `slip` | Slip Hazards (Bathroom layout, high shower steps, slick tiling) |
| `trip` | Trip Hazards (Loose rugs, frayed carpets, trailing cords) |
| `light` | Visibility Issues (Dark hallways, steep stairwells, poor landing lights) |
| `access` | Structural/Access (Narrow doorways, heavy doors, split-level steps) |

### Options Detail: `hazard_flags` (no branch)

| Value | Label |
|-------|-------|
| `stairs` | Managing the stairs safely |
| `bathing` | Navigating the bathroom (getting in/out of the bath/shower) |
| `clutter` | General clutter, low lighting, or uneven flooring thresholds |
| `entry` | Getting into the house safely (steep external steps or heavy thresholds) |

### Fields (continued)

| # | Key | Type | Question | Options | Component |
|---|-----|------|----------|---------|-----------|
| 9 | `digital_literacy` | radio | "How confident is [Name] with digital technology?" | `pro`, `casual`, `skeptic`, `resistant` | `ValidatedRadioGroup` |
| 10 | `has_pets` | radio | "Does [Name] have any pets that they adore?" | `yes`, `no` | `ValidatedRadioGroup` |
| 11 | `hobbies_social` | text/tags | "What are [Name]'s favourite hobbies or main sources of social interaction right now?" | — | `TextInput` (tags-style) |

### Options Detail: `digital_literacy`

| Value | Label |
|-------|-------|
| `pro` | Very confident (shops online, uses video calls, manages apps) |
| `casual` | Uses basic features (WhatsApp/texts) but gets anxious with admin, updates, or passwords |
| `skeptic` | Basic mobile for calls only, completely offline |
| `resistant` | Actively dislikes technology and refuses to use it |

### Options Detail: `has_pets`

| Value | Label |
|-------|-------|
| `yes` | Yes, they have a pet(s) |
| `no` | No pets |

---

## Screen 4: Support Circle

**Route:** `/step4`  
**Page:** `src/pages/step4.astro`  
**Status:** IMPLEMENTED  
**Schema:** NOT YET DEFINED (needs `fourthStepSchema` — dynamic array)  
**Title:** "Final Details" *(title may need updating from PSD)*  
**Subtitle:** "One last step before we create your plan." *(subtitle may need updating)*

```
┌─────────────────────────────────────────────────┐
│  STEP 4: The Support Circle                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  "Tell us about anyone else in your support     │
│   circle who can help out when the time comes    │
│   (siblings, partners, extended family, or      │
│   helpful neighbours)."                         │
│                                                 │
│  ┌─ Person #1 ─────────────────────────────┐   │
│  │ helper_name       [text input      ]     │   │
│  │ helper_relationship                     │   │
│  │   [ dropdown: sibling/partner/...  v ]  │   │
│  │ helper_proximity                        │   │
│  │   [ dropdown: near/mid_distance/... v ] │   │
│  │ helper_time                             │   │
│  │   [ dropdown: high/moderate/...  v ]    │   │
│  │ helper_superpower                       │   │
│  │   [ dropdown: admin/fixer/...    v ]    │   │
│  │                            [ Remove ]   │   │
│  └──────────────────────────────────────┘   │
│                                                 │
│  ┌─ Person #2 (if added) ─────────────────┐   │
│  │  ...                                    │   │
│  └──────────────────────────────────────┘   │
│                                                 │
│                  [ + Add Person ]               │
│                                                 │
│                  [ Continue -> Summary ]         │
└─────────────────────────────────────────────────┘
```

### Fields (per person, dynamic array)

| # | Key | Type | Options | Component |
|---|-----|------|---------|-----------|
| 12 | `helper_name` | text | — | `TextInput` |
| 13 | `helper_relationship` | dropdown | `sibling`, `partner`, `grandchild`, `extended_family`, `friend_neighbor` | `Select` |
| 14 | `helper_proximity` | dropdown | `near`, `mid_distance`, `abroad` | `Select` |
| 15 | `helper_time` | dropdown | `high`, `moderate`, `very_limited` | `Select` |
| 16 | `helper_superpower` | dropdown | `admin`, `fixer`, `coordinator`, `companion` | `Select` |

### Options Detail: `helper_relationship`

| Value | Label |
|-------|-------|
| `sibling` | Sibling |
| `partner` | Partner |
| `grandchild` | Grandchild |
| `extended_family` | Extended family |
| `friend_neighbor` | Friend / Neighbour |

### Options Detail: `helper_proximity`

| Value | Label |
|-------|-------|
| `near` | Near (under 30 mins away) |
| `mid_distance` | Mid-distance (1+ hours away, in UK) |
| `abroad` | Abroad (internationally located / different time zone) |

### Options Detail: `helper_time`

| Value | Label |
|-------|-------|
| `high` | High availability |
| `moderate` | Moderate availability |
| `very_limited` | Very limited availability |

### Options Detail: `helper_superpower`

| Value | Label | Description |
|-------|-------|-------------|
| `admin` | The Admin/Numbers Wizard | Finances, forms, bills, digital setup |
| `fixer` | The Fixer | Practical tasks, DIY, local emergency drop-in |
| `coordinator` | The Coordinator | Appointments, calls, care research |
| `companion` | The Companion | Emotional support, check-ins, social visits |

### Store Structure: `support_circle`

```ts
support_circle: Array<{
  helper_name: string
  helper_relationship: "sibling" | "partner" | "grandchild" | "extended_family" | "friend_neighbor"
  helper_proximity: "near" | "mid_distance" | "abroad"
  helper_time: "high" | "moderate" | "very_limited"
  helper_superpower: "admin" | "fixer" | "coordinator" | "companion"
}>
```

Min 0 entries, max no hard limit (UI guidance: "Add as many as you need").

---

## Screen 5: Summary & Submission

**Route:** `/summary`  
**Page:** `src/pages/summary.astro`  
**Status:** PLACEHOLDER (no fields implemented)  
**Schema:** NOT YET DEFINED (needs `summarySchema`)  
**Layout:** Differs from StepLayout — uses solid white card, no glassmorphism, no blobs, no footer ContinueButton. Renders with base `Layout.astro`.

```
┌─────────────────────────────────────────────────┐
│  SUMMARY: Review Your Plan                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─ Review Card ───────────────────────────┐   │
│  │  (read-only summary of all steps)        │   │
│  │                                          │   │
│  │  Step 1: Core Identities   [ edit ]      │   │
│  │  Step 2: Systemic Safeguards [ edit ]    │   │
│  │  Step 3: Environment & Life [ edit ]     │   │
│  │  Step 4: Support Circle     [ edit ]     │   │
│  └──────────────────────────────────────┘   │
│                                                 │
│  ┌─ Legal Gate ────────────────────────────┐   │
│  │  [ ] I understand that this plan is for  │   │
│  │      informational purposes only and     │   │
│  │      does not replace professional       │   │
│  │      legal, financial, or medical        │   │
│  │      advice. I agree to the              │   │
│  │      Terms & Disclaimer.                 │   │
│  └──────────────────────────────────────┘   │
│                                                 │
│  ┌─ Submission ────────────────────────────┐   │
│  │                                         │   │
│  │  email_recipients   [text input    ]    │   │
│  │  (comma-separated, optional)            │   │
│  │                                         │   │
│  │  custom_message     [textarea      ]    │   │
│  │  (optional message to recipients)       │   │
│  │                                         │   │
│  │         [ Generate My Plan ]             │   │
│  └───────────────────────────────────────┘   │
│                                                 │
│  Link to full Terms & Disclaimer (modal/page)   │
└─────────────────────────────────────────────────┘
```

### Fields

| # | Key | Type | Question | Options |
|---|-----|------|----------|---------|
| 17 | `disclaimer_agreed` | checkbox (mandatory) | "I understand that this plan is for informational purposes only..." | unchecked by default |
| 18 | `email_recipients` | text (optional) | "Share this plan with your support circle" | comma-separated emails |
| 19 | `custom_message` | textarea (optional) | Optional message to recipients | — |

### Submission Gate

- **Button text:** "Generate My Plan"
- **Button state:** disabled until `disclaimer_agreed === true`
- **Submit action:** POST all form data to n8n webhook → triggers LLM + PDF generation + email

### Disclaimer Reference

The full legal disclaimer text is defined in the PSD (Sections 1–5 covering informational purpose, no professional-client relationship, seek professional guidance, limitation of liability, data privacy). It must be:
- Accessible via link or modal from the summary page
- Hard-coded on the final page of the generated PDF report

---

## Store Schema Cross-Reference

The Zustand store (`src/store/form.ts`) maps to this spec as follows:

```
form.ts                              This spec
─────────────────────────────────────────────────
firstStepSchema (L6-13)       <--->  Screen 1 fields (1-3)
(not yet defined)             <--->  Screen 2 fields (4-6)
(not yet defined)             <--->  Screen 3 fields (7-11 + conditional 8b)
(not yet defined)             <--->  Screen 4 fields (12-16, dynamic array)
(not yet defined)             <--->  Screen 5 fields (17-19)
stepSchemas registry (L44-46) <--->  One entry per screen
STEP_ORDER (L24)              <--->  Screen flow order
```

### Required Store Additions

```
Need to add schemas:
  secondStepSchema   -> lpa_status, psr_status, documents_loc
  thirdStepSchema    -> home_type, ourlens_completed, hazard_flags,
                        digital_literacy, has_pets, hobbies_social
  fourthStepSchema   -> support_circle (z.array(personSchema))
  summarySchema      -> disclaimer_agreed, email_recipients, custom_message

Need to extend FormState with:
  lpa_status, psr_status, documents_loc,
  home_type, ourlens_completed, hazard_flags,
  digital_literacy, has_pets, hobbies_social,
  support_circle: Person[],
  disclaimer_agreed, email_recipients, custom_message

Need to register all schemas in stepSchemas:
  "/step2": secondStepSchema,
  "/step3": thirdStepSchema,
  "/step4": fourthStepSchema,
  "/summary": summarySchema,
```

---

## Implementation Status

```
Screen  Route       Status        Fields  Components
──────  ─────       ──────        ──────  ──────────
Step 1  /step1      DONE          3/3     ValidatedInput(x2), ParentHealthRadioGroup
Step 2  /step2      PLACEHOLDER   0/3     —
Step 3  /step3      DONE          5/5     ValidatedRadioGroup, ValidatedCheckboxGroup, TextInput
Step 4  /step4      DONE          5/5     ValidatedSelect, SupportCircleRepeater, TextInput
Summary /summary    PLACEHOLDER   0/3     — (needs disclaimer gate)
```

---

## Component Inventory Needed

```
Component                    Type          Used In   For Fields
─────────────────────────────────────────────────────────────────
ValidatedInput              atom (exists)  Step 1    user_name, parent_name
ValidatedRadioGroup         atom (exists)  Steps 1-3 parent_health, lpa_status, etc.
ParentHealthRadioGroup      molecule (exists) Step 1  parent_health (wrapped)
ContinueButton              atom (exists)  All steps  Navigation
ProgressBar                 atom (exists)  Layout    Step indicators
ResumeRedirect              atom (exists)  Index     Resume logic
StepGuard                   hook (exists)  All steps  Access guard
ValidatedCheckboxGroup      atom (NEW)     Step 3    hazard_flags
ValidatedSelect             atom (NEW)     Step 4    helper_relationship, proximity, time, superpower
SupportCircleRepeater       molecule (NEW) Step 4    Dynamic person list
DisclaimerCheckbox          molecule (NEW) Summary   disclaimer_agreed
EmailShareSection           molecule (NEW) Summary   email_recipients, custom_message
SubmitButton                molecule (NEW) Summary   Generate My Plan
```

## Requirements

### Requirement: Back Navigation in Component Inventory
The component inventory SHALL include a back navigation atom to allow returning to the previous step.

#### Scenario: Back navigation component is listed
- **WHEN** checking the components for form steps
- **THEN** a Back navigation link component is available for steps 2 and beyond

### Requirement: Implementation Status
The implementation status of form screens MUST be tracked.

#### Scenario: Step 3 is implemented
- **WHEN** the Step 3 functionality is complete
- **THEN** the implementation status table MUST list Step 3 as DONE and list its fields and components as complete.

#### Scenario: Step 4 is implemented
- **WHEN** the Step 4 functionality is complete
- **THEN** the implementation status table MUST list Step 4 as DONE and list its fields and components as complete.

#### Scenario: Summary is implemented
- **WHEN** the Summary functionality is complete
- **THEN** the implementation status table MUST list Summary as DONE and list its fields and components as complete.

### Requirement: Summary Review and Disclaimer
The Summary page SHALL display a read-only review of all previously filled-in form information. The page MUST include an unchecked checkbox for the legal disclaimer. The "Generate My Plan" button MUST be disabled until this checkbox is ticked. When the button is clicked, all form data MUST be printed to the console.

#### Scenario: Viewing the summary page
- **WHEN** the user navigates to the summary page
- **THEN** they see a read-only review card containing all filled-in information from previous steps
- **THEN** the legal disclaimer checkbox is unchecked
- **THEN** the "Generate My Plan" button is disabled

#### Scenario: Submitting with disclaimer accepted
- **WHEN** the user is on the summary page and ticks the legal disclaimer checkbox
- **THEN** the "Generate My Plan" button becomes enabled
- **WHEN** the user clicks the "Generate My Plan" button
- **THEN** all collected form details are printed to the console

