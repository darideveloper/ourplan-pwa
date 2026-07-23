## 1. Update link and remove local terms page

- [x] 1.1 Change `href="/terms"` to `href="https://ourlivesapp.com/our-plan-terms-and-conditions/"` in `src/components/atoms/TermsCheckbox.tsx`
- [x] 1.2 Delete `src/pages/terms.astro`
- [x] 1.3 Run `pnpm build` to verify no broken references

## 2. Sync and archive

- [x] 2.1 Run `opsx-sync-specs` to update main access-validation spec with the resolved link target
- [ ] 2.2 Run `opsx-archive` to archive this change
