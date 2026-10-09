# Validation

Validated on 9 October 2026.

## Automated package checks

- TypeScript compilation passes for the gallery and the library.
- Production gallery build passes.
- Library builds as ES modules and CommonJS with TypeScript declarations.
- 217 Node tests pass with no failures.
- Every one of the 210 components renders with defaults, custom content, and an empty item collection.
- Public exports are available in both module formats.
- Controlled values, computed prices, provider motion disabling, unique field/SVG IDs, and safe button types are checked.

## Browser checks

Checked in Chromium at 1440 × 1050 and 390 × 844.

- All 14 collections display their 15 components on mobile.
- No document horizontal overflow or oversized preview surfaces in the mobile category scan.
- Search, category selection, saved-state persistence, and persistent motion pause work.
- Number-stepper values and OTP focus progression work.
- Tabs support arrow-key navigation.
- Hold-to-confirm cancels early release and completes only after the hold duration.
- Coupon submission, comment composition, poll totals, list reordering, and kanban movement work.
- Native dialogs contain focus, close with Escape, and restore trigger focus.
- Source and usage tabs load actual source modules and package examples.
- Mobile navigation, documentation, and component playgrounds fit the viewport.
- Comparison sliders emit their changed values.
- System reduced-motion preferences disable pointer tilt and decorative animation.
- No runtime exceptions occurred during the interaction checks.

## Scope

The previews use illustrative local data. Backend service integrations and native media playback with consumer-supplied URLs require testing in the consuming application. Browser checks do not constitute a full screen-reader or cross-browser accessibility audit.

## Custom icon and motion update — 2026-10-10

- Replaced font-symbol arrows and control icons across all 14 collections with original SVG drawings. Exported ProsIcon with typed names and decorative/labeled accessibility modes.
- Production gallery, ESM/CJS library, and declarations build successfully; all 217 existing tests pass.
- Desktop 1440 × 1050: verified pointer-responsive hero layers and running scroll-reveal animations, and checked all collections for unnamed icon-only buttons.
- Mobile 390 × 844: all 14 collections render 15 previews each, with no page overflow or significantly overflowing preview stages. Navigation and the icon-source tab work.
- Motion-off and system reduced-motion cancel gallery Web Animations, reset pointer movement, and disable CSS animation. No browser console errors.
