# Automated Tests

Run them all before every commit to `main`. GitHub Actions also runs them on every push.

| Layer         | Tool                     | Command            | What it checks                                                                                                   | Count      |
| ------------- | ------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------- | ---------- |
| Unit          | Vitest                   | `npm run test:run` | Gate logic, circuit evaluation, solver, level files, board rules, scoring, progress, hints, server API, settings | 170 tests  |
| Component     | Vitest + Testing Library | (included above)   | Level page, World Map, Learn page, Settings page, tutorial                                                       | (included) |
| End-to-end    | Playwright               | `npm run test:e2e` | The real game in Chrome: navigation, playing, saving progress, AI hints (mocked), keyboard play, phone layout    | 12 tests   |
| Content       | Playwright               | (included above)   | **All 30 levels are solved by clicking through the real interface**                                              | 30 tests   |
| Accessibility | axe-core + Playwright    | (included above)   | No WCAG 2.1 A/AA problems on any page (contrast, labels, roles)                                                  | 5 pages    |

**Browser tests in total: 47** (12 end-to-end + 30 levels + 5 accessibility).

## Useful commands

```bash
npm run test:e2e            # run all browser tests
npm run test:e2e:ui         # open Playwright's visual test runner
npx playwright test --project=phone   # only the phone-size tests
npx playwright show-trace test-results/<folder>/trace.zip   # replay a failed test step by step
```

## Bugs found by the automated tests

| Bug                                                              | Found by               | Fix                                                                    |
| ---------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| Grey "off" switches had too little contrast (2.8:1, needs 4.5:1) | axe accessibility test | New darker `--off-surface` colour for buttons                          |
| "Try it" and "Truth table" labels were too faint                 | axe accessibility test | Removed the transparency                                               |
| Locked level names on the World Map were too faint               | axe accessibility test | Readable muted colour + dashed border instead of fading the whole tile |
