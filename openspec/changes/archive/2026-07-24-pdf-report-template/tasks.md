## 1. Create template file

- [x] 1.1 Create directory `public/templates/`
- [x] 1.2 Create `public/templates/report-template.html` with basic HTML5 document structure (`<!doctype html>`, `<html>`, `<head>`, `<body>`)
- [x] 1.3 Add `<meta charset="UTF-8">` and `<meta name="viewport">` to `<head>`

## 2. Implement header

- [x] 2.1 Add `<header>` element with the OurPlan logo image (`src="https://ourplan.ourlivesapp.com/ourplan-logo.png"`, `alt="OurPlan"`)
- [x] 2.2 Add report title "OurPlan — Estate Planning Guide" as a heading inside `<header>`
- [x] 2.3 Add `<span id="report-date"></span>` for the dynamic date, with inline JS that sets `textContent` using `new Date().toLocaleDateString('en-GB', ...)`

## 3. Implement main content area

- [x] 3.1 Add `<main>` element between header and footer
- [x] 3.2 Place `{{ $('Report Agent').item.json.output }}` as the sole content inside `<main>`

## 4. Implement footer

- [x] 4.1 Add `<footer>` element with disclaimer text: "OurPlan is an automated informational guide by Ourlives and does not constitute legal, financial, or clinical medical advice."
- [x] 4.2 Add clickable link `https://www.ourlivesapp.com` inside footer with text "See full terms at www.ourlivesapp.com"

## 5. Add CSS styles

- [x] 5.1 Add embedded `<style>` block in `<head>` with brand colours (coral `#fe676e`/`#dd4d57`, gold `#febc26`, white `#fffffe`, dark text `#1a1a2e`)
- [x] 5.2 Add `@page { size: A4; margin: 20mm }` rule
- [x] 5.3 Add flexbox sticky-footer layout (`body { display: flex; flex-direction: column; min-height: 100vh; }`, `main { flex: 1; }`)
- [x] 5.4 Add system UI font stack: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
- [x] 5.5 Add `img { max-width: 100%; height: auto; }` for logo responsiveness
- [x] 5.6 Add `page-break-inside: avoid` and `page-break-before: always` rules for agent-generated sections

## 6. Accessibility and quality fixes

- [x] 6.1 Add `:focus-visible` outline style to footer link (keyboard navigation)
- [x] 6.2 Add explicit `width="300"` and `height="300"` to logo `<img>` (prevents CLS)
- [x] 6.3 Add `translate="no"` to `<title>` (brand name protection)
- [x] 6.4 Add `translate="no"` to `<h1>` (brand name protection)
- [x] 6.5 Wrap "OurPlan" and "Ourlives" in footer with `<span translate="no">` (brand name protection)

## 7. Header layout polish

- [x] 7.1 Change header from `flex-direction: column` to `flex-direction: row` with `justify-content: space-between` (logo left, text right)
- [x] 7.2 Fix logo width: replace `max-width: 100%` with fixed `height: 60px; width: auto` (prevent full-width stretch)
- [x] 7.3 Wrap title + date in `<div class="header-text">` with `text-align: right` for right-aligned text block

## 8. Verify

- [x] 8.1 Run `pnpm build` and confirm `dist/templates/report-template.html` exists
- [x] 8.2 Confirm no build errors
