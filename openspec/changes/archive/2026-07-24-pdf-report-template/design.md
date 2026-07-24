## Context

The n8n backend generates PDF reports via Gotenberg (Chromium-based HTML→PDF converter). An AI agent receives the completed form data and generates the report body. The agent needs a branded HTML shell to wrap its output in — this shell is the template. No PDF generation or agent logic lives in this repo.

Gotenberg accepts HTML input, renders it in headless Chromium, then exports via `page.printToPDF()`. This means the template renders in a browser environment first, then converts to PDF. CSS must work in both contexts.

## Goals / Non-Goals

**Goals:**
- Single self-contained HTML file that Gotenberg can consume
- Fixed header with brand logo + report title + auto-generated date
- Fixed footer with disclaimer text and link to ourlivesapp.com
- Dynamic `<main>` area — agent fills this via `{{ $('Report Agent').item.json.output }}` placeholder
- CSS handles A4 print layout while rendering correctly in Chromium screen mode
- UK English spelling throughout

**Non-Goals:**
- No logo bundling (referenced from remote URL)
- No JS logic beyond the inline date
- No form data mapping in this repo (agent handles that)
- No offline fallback for the logo or fonts

## Decisions

### Template location: `public/templates/report-template.html`

Placing the file under `public/` means Astro serves it as a static asset. n8n can fetch it at `https://ourplan.ourlivesapp.com/templates/report-template.html`. The `templates/` subdirectory keeps it organised separately from pages and other static files.

### Placeholder syntax: `{{ $('Report Agent').item.json.output }}`

Simple Mustache-style markers inside the HTML. The n8n agent reads the template, finds `{{ $('Report Agent').item.json.output }}`, and replaces it with its generated HTML. This is the only dynamic part of the template — everything else is fixed.

### Date: JS inline at render time

```html
<span id="report-date"></span>
<script>
  document.getElementById('report-date').textContent = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
</script>
```

UK date format (e.g. "24 July 2026"). Runs on page load before Gotenberg captures the PDF.

### Logo: remote URL reference

`<img src="https://ourplan.ourlivesapp.com/ourplan-logo.png" alt="OurPlan">`

Gotenberg Chromium fetches remote images. No need to bundle assets. URL is stable and versioned via the public domain.

### CSS strategy: screen-first + `@page` + print enhancements

| Concern | Approach | Rationale |
|---|---|---|
| Base styles | Screen-first with `rem`, flex, colours | Chromium renders in screen mode first |
| Page dimensions | `@page { size: A4; margin: 20mm }` | Gotenberg respects CSS `@page` rules |
| Page breaks | `page-break-inside: avoid` on sections, `page-break-before: always` for major sections | Agent-generated content can span multiple pages cleanly |
| Colours | Brand coral `#fe676e`, gold `#febc26`, white `#fffffe`, dark text `#1a1a2e` | Consistent with OurPlan branding (favicon, theme-color `#dd4d57`) |
| Fonts | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | Available in Chromium, no web font loading delay |
| Images | `max-width: 100%; height: auto` | Logo scales with container |

### Layout structure

The template uses a sticky-footer pattern via CSS flexbox so the footer stays at the bottom even when `<main>` has little content:

```
body { display: flex; flex-direction: column; min-height: 100vh; }
main { flex: 1; }
```

### No HTML wrapper from agent

The agent generates content that goes inside `<main>`. It should not include `<html>`, `<head>`, `<body>`, or `<main>` tags — just the inner HTML (headings, paragraphs, sections, tables, lists). The template already provides the full document wrapper.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Remote logo unreachable at render time | Gotenberg can be configured with a timeout. Consider adding inline SVG fallback if logo URL is unstable, but not needed for v1. |
| Agent generates invalid HTML | Agent is LLM-based with prompt instructions to produce valid HTML. No schema validation in this repo. |
| `@page` margin mismatch with header/footer | Header and footer are in-flow HTML elements (not `@page margin boxes`). This gives the agent full control over content placement. Test with Gotenberg before release. |
| Date shows English locale regardless of user | UK English is the project language (AGENTS.md). `en-GB` locale is hardcoded, matching the form content language. |
