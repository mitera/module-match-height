<a name="unreleased"></a>
# Unreleased

### release summary

- Fix: type declarations imported `Settings` from `"types"` (bare specifier) instead of `"./types"`, breaking consumers' TypeScript; `Settings` is now also exported
- Fix: `property` is optional in `Settings`, callbacks and `remove` are properly typed (`HTMLElement | NodeList | HTMLElement[]`)
- Fix: `remove` elements no longer contribute to the max height of the group
- Fix: hidden elements (`display: none`) are skipped instead of being locked to `0px`
- Fix: rows with a single element (and no `target`) are no longer locked to a fixed height
- Fix: heights are updated again on window `load` (images and other media), as documented
- Fix: `_unbind()` also removes the pending `DOMContentLoaded`/`load` listeners and the throttle timer
- Fix: camelCase `property` values (e.g. `minHeight`) are converted to kebab-case instead of being silently ignored
- Fix: row processing is iterative instead of recursive; negative heights are clamped to `0`
- Security: `attributeName` is validated with a strict pattern and `attributeValue` is compared in JS instead of being concatenated in a CSS selector
- Added `dataApi` option (default `true`) to skip the `data-mh` / `data-match-height` groups on instances sharing the same container
- Package: published files limited to `dist` (plus README, LICENSE), removed unused `esbuild` dev dependency and the empty `dist/types.js` / `dist/types.min.js`
- Docs: fixed links to the `main` branch and the download link, documented `attributeValue` and `dataApi`
- Security: updated dev dependencies (`rollup` GHSA-mw96-cpmx-2vgc, `picomatch` GHSA-3v7f-55p6-f55p / GHSA-c2c7-rcm5-vvqj)

<a name="1.1.0"></a>
# 1.1.0 (2026-02-23)

### release summary

Removed redundant comments and unused code, simplified methods, and introduced type definitions for improved maintainability and readability. Enhanced logic for processing elements and applying height matching with optimized row handling.

<a name="1.0.3"></a>
# 1.0.3 (2025-05-31)

### release summary

- Refactor `var` to `let` throughout the codebase

<a name="1.0.2"></a>
# 1.0.2 (2025-05-26)

### release summary

- Code refactor
- Removed unused variables and methods.
- Add beforeUpdate and afterUpdate callback hooks.
- Update documentations

<a name="1.0.1"></a>
# 1.0.1 (2024-01-18)

### release summary

- Change optional settings on TS definition

<a name="1.0.0"></a>
# 1.0.0 (2024-01-16)

### release summary

- initial release