# Contributing to Pros

Pros is maintained by [draexon](https://github.com/draexon). Small, focused fixes are welcome. Open an issue before starting a new collection or changing a public API.

## Development

Use Node.js 24 and npm. Run `npm ci`, then `npm run dev`. Components live in `src/library/`; exports and catalog entries must stay in sync. Do not edit generated `dist/` or `site/` files. `npm ci` also builds the library into `dist/` through the `prepare` script, which is what makes the GitHub install work.

## Before submitting

- Run `npm run check`, `npm run build`, `npm test`, and `npm run test:browser`. On Linux, first run `npx playwright install --with-deps chromium`. Windows uses installed Edge by default.
- Check keyboard navigation, visible focus, empty and disabled states, both themes, narrow screens, and reduced motion.
- Add behavior tests for changes to state or interaction. Keep small visual changes focused.
- Use the shared theme and motion helpers. Avoid new runtime dependencies unless the change needs them.
- Describe the problem, resulting behavior, and validation in the pull request. Attach before/after screenshots for visual changes.
- Keep copy direct. Preserve the repository's no-em-dash convention.

Never commit secrets, payment details, generated bundles, or personal test data. Contributions must be your own work or include permission and any required license notices. Submitted contributions use this repository's MIT license. No CLA is required.
