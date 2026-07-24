## 1. Update TermsCheckbox URL

- [x] 1.1 Change href in `src/components/atoms/TermsCheckbox.tsx` from `https://ourlivesapp.com/our-plan-terms-and-conditions/` to `https://www.ourlivesapp.com/terms-conditions/`

## 2. Add Link to DisclaimerCheckbox

- [x] 2.1 Wrap "Terms & Disclaimer" text in `src/components/atoms/DisclaimerCheckbox.tsx` with an `<a>` tag linking to `https://www.ourlivesapp.com/terms-conditions/`, matching the styling from `TermsCheckbox` (`target="_blank"`, `rel="noopener noreferrer"`, `underline text-primary hover:text-primary/80`, `stopPropagation`)

## 3. Verify

- [x] 3.1 Run `pnpm build` to confirm no type or lint errors
