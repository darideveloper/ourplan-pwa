## Why

The n8n backend uses an AI agent to generate personalised PDF reports after form submission. The agent needs an HTML template shell with fixed branding (header, footer, CSS) so it only fills in the report body. Without this template, there is no consistent branded output for the PDF generation pipeline.

## What Changes

- Add a self-contained HTML template at `public/templates/report-template.html`
- Template has fixed `<header>` (logo + report title + dynamic date) and fixed `<footer>` (disclaimer with link to ourlivesapp.com)
- `<main>` content is empty — injected by n8n agent via `{{ $('Report Agent').item.json.output }}` placeholder
- All CSS embedded in a single `<style>` block, screen-first with `@page` rules for Gotenberg A4 output
- Logo referenced from remote URL (`https://ourplan.ourlivesapp.com/ourplan-logo.png`)
- No backend logic, no PDF generation code, no agent code in this repo

## Capabilities

### New Capabilities
- `pdf-report-template`: self-contained HTML template for Gotenberg PDF generation, with fixed brand shell and dynamic main content area

### Modified Capabilities

None.

## Impact

- New file: `public/templates/report-template.html`
- No existing code changed
- No new dependencies
- No backend changes
