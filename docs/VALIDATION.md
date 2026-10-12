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

## Custom icon and motion update - 2026-10-10

- Replaced font-symbol arrows and control icons across all 14 collections with original SVG drawings. Exported ProsIcon with typed names and decorative/labeled accessibility modes.
- Production gallery, ESM/CJS library, and declarations build successfully; all 217 existing tests pass.
- Desktop 1440 × 1050: verified pointer-responsive hero layers and running scroll-reveal animations, and checked all collections for unnamed icon-only buttons.
- Mobile 390 × 844: all 14 collections render 15 previews each, with no page overflow or significantly overflowing preview stages. Navigation and the icon-source tab work.
- Motion-off and system reduced-motion cancel gallery Web Animations, reset pointer movement, and disable CSS animation. No browser console errors.

## Theme, dropdown and interaction update - 2026-10-10

- Production gallery, ESM/CJS library, and TypeScript declarations build successfully.
- All 221 Node tests pass, including all 210 component markers, both provider themes, disabled dropdowns, and the em dash scan.
- All 11 repeatable Playwright tests pass against the production build in Chromium (Microsoft Edge).
- All 210 previews render at 390px and 1440px in light and dark themes without document overflow.
- Popover, split-button, and context menus support Arrow/Home/End navigation, Escape, selection, outside dismissal, focus return, and viewport positioning.
- Confirm/undo events, saved-item Undo, dialog exit motion, and skip-link focus are verified.
- Theme choice persists and switches both directions; motion-off and system reduced-motion leave no running animations after settling.
- Browser checks report no runtime exceptions. A desktop dark-theme preview is saved in dark-mode.png.

Run npm run build, npm test, and npm run test:browser to repeat the checks.

## Smooth selection and synchronized themes - 2026-10-10

- Restored component-specific layout transitions instead of overriding them with shared button rules.
- Image accordion width, artwork, and captions animate in both directions and during rapid reversals; arrow keys, Home, End, and disabled controls are supported.
- Pill tabs, segmented buttons, documentation tabs, and view controls use a measured sliding highlight.
- Theme crossfades snapshot the final palette with local color transitions suspended, eliminating delayed component recoloring. Rapid repeated switches safely cancel obsolete snapshots.
- All 221 library tests pass. The expanded browser suite checks intermediate accordion widths, moving tab highlights, reduced motion, exact colors during and after both theme transitions, and rapid-switch cancellation.
- All 15 production browser tests pass in Chromium (Microsoft Edge).

## Animated theme reveal - 2026-10-10

- Replaced the crossfade with a 700ms circular reveal originating at the theme icon, accompanied by icon rotation and subtle background zoom.
- Reveal radius is calculated from the farthest viewport corner so desktop and mobile screens are fully covered.
- Final component colors remain synchronized throughout both directions, including rapid-switch cancellation and reduced-motion behavior.
- Visually inspected the midpoint on desktop and checked mobile reveal geometry.
- All 16 browser regressions pass: the 15 existing interaction tests plus the desktop/mobile reveal-origin and corner-coverage test. Production build passes.

## Paper sweep, shortcut search, and styled sorting - 2026-10-10

- Replaced the circular theme reveal with three offset diagonal strips that sweep in opposing directions for light and dark. Final colors remain synchronized, and motion preferences are preserved.
- Slash focuses and smoothly scrolls to search; text entry, modifier shortcuts, and open dialogs are protected. Escape clears the query, then returns focus.
- Replaced the native sort dropdown with a styled, viewport-positioned radio menu, descriptive rows, checked selection, animated entrance/exit, and arrow/Home/End/Escape navigation.
- All 221 library tests and 18 production browser tests pass. Both desktop and mobile theme paths, search typing/focus, sorting results, selected-option focus, and animation frames are covered.
- Visually inspected the sort menu and stepped theme transition midpoint. Production build passes.

## Consumer app blocks

- Added eight exported consumer app blocks: DiscoveryHub, TrendingBoard, CollectionStudio, ShoppingBag, CheckoutPanel, MembershipStudio, OrderJourney, and RewardsWallet. The catalog now contains 218 components across 15 collections.
- Gallery cards and playgrounds give large blocks room at desktop widths and collapse cleanly for phones. Reviewed all eight rendered blocks, including light and dark surfaces, with a gallery screenshot at `docs/app-blocks.png`.
- Typed data props support application content, images, payment methods, products, memberships, delivery milestones, and rewards. Monetary values use currency minor units. Integrated checkout waits for the caller's promise and requires actual supplied payment methods; default checkout is a clearly labeled preview.
- Added panel height transitions in both directions, staggered content entrances, animated counts, selection feedback, reversible collection/cart edits, and checkout confirmation. Reduced motion and the provider motion switch disable these effects. Undo retains keyboard focus.
- `npm run build` and the ESM/CommonJS/declaration builds pass. All 231 library tests pass, including custom currencies, invalid monetary amounts, empty render cases, and the em dash scan.
- Nine new browser checks cover filtering/saving, search/removal/undo, cart totals/shipping, checkout review/focus/demo mode, membership prices, order inspection, reward eligibility, 360px/1440px control bounds, reverse height motion, reduced motion, empty/disabled data, and integrated checkout pending/failure/retry/success. The test fixture bundles in memory and is not shipped with the gallery.
- Full preview coverage includes all 218 components at 390px and 1440px in both themes. An existing selection animation assertion now waits for fonts and compares against the current target, so a late one-pixel layout correction does not cause a false failure.
- All 27 browser scenarios pass, including three repeat runs each of the corrected PillTabs and SegmentButton animation checks.

## Repository preparation and interface polish

- Moved focus rings outside grouped search, password, tag, number, and collection fields. Search clear restores focus; mobile text fields use readable sizing.
- Added scroll-direction sticky navigation, keyboard focus recovery, a persistent mobile menu, and separate draexon profile and repository Star links.
- Shortened scroll reveals and removed their scale effect. Replaced promotional gallery/app-block copy with concrete descriptions and controls.
- Added the MIT license and package metadata, Code of Conduct, contributing/security guidance, changelog, issue/PR templates, CODEOWNERS, and a read-only validation workflow.
- Production build, 231 library tests, and all 29 browser tests pass. New checks verify the outer focus ring, search clear, scroll direction, keyboard recovery, and mobile navigation. Visually checked the original reported field at 390px.
- Created issues #1, #2, and #3 under the verified draexon account for additional browser engines, automated accessibility checks, and controlled app-block state. Repository visibility remains PRIVATE.

## Hover restraint and repository stars

- Removed magnetic pointer tracking from website buttons and hover movement from gallery controls. Color, shadow, and small arrow transitions provide feedback; component hover styles remain independent.
- Component click feedback now settles without overshoot, with a lighter press for larger controls. Gallery controls no longer inherit the component click animation.
- The navbar displays the actual verified repository star count and refreshes from GitHub's unauthenticated public API when accessible. Private/offline/rate-limited cases retain the verified snapshot; `npm run update:repo-stats` updates it using the authenticated CLI without exposing credentials.
- Build and all 231 library tests pass. All 33 browser scenarios verified, including the new hover and live/fallback/invalid star-count checks. The hover assertion accepts both identity matrices and `none` as zero movement.
