---
description: Run full OpenSpec cycle: explore → propose → self-validate → user-validate → apply → archive
---

Run the full OpenSpec development cycle.

Task: $ARGUMENTS

## Protocol
Execute steps strictly in order. Report progress at each transition.
If a step fails, report the error and ask how to proceed.
If the user asks to skip or reorder steps, follow their lead.

## Step 1 — Explore
Load the openspec-explore skill. Investigate the problem, explore the
codebase, gather context. Present a clear summary of findings.

## Step 2 — Propose
Load the openspec-propose skill. The change name or description is:
"$ARGUMENTS". Create all artifacts (proposal, design, tasks).

## Step 3 — Self-validate (loop)
Read all created artifacts from openspec/changes/<name>/.

Validate for:
- **Internal consistency**: Is scope clear? Design consistent with
  proposal? Tasks actionable? Edge cases covered?
- **Project conventions**: Follows AGENTS.md, project structure, naming
  patterns, and architecture style?

If issues found:
- Edit the artifact files to fix them
- Re-read and re-validate
- Max 3 rounds

If clean after a round → proceed.
If 3 rounds reached with issues remaining → report to user, ask guidance.

Report: "Proposal validated — [summary of checks and fixes]"

## Step 4 — Present and wait for user validation
Read and display the final artifacts. List every file.
**STOP.** Ask the user to review.
Do NOT continue until they explicitly say "proceed" or "approved".

## Step 5 — Apply
Load the openspec-apply-change skill. Implement each task.

## Step 6 — Archive
Load the openspec-archive-change skill. Archive the completed change.
