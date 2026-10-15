# Name your bébé!

The intercultural baby name generator. Originally developed as a first React
project for the Frameworks and Architectures for the Web course in Spring 2020
at the IT University of Copenhagen.

[Open the app](https://name-your-bebe.web.app/).

## Version 2.0

Version 2.0 improves name generation, adapts the interface to mobile devices,
modernises the dependencies and build tools, and migrates the app to TypeScript.

### Name generation and retries

- Multiple selected languages are now tried in a random order, with each having
  an equal chance of being chosen first. Each request sends one valid `usage`
  filter, so every selected language can contribute suggestions.
- If a language returns no name, the app tries another selected language. It
  stops at the first match or after trying each distinct language once, keeping
  the chosen gender throughout. With no languages selected, it makes one request
  using the API's default usage.
- Retries wait 550 ms after an empty response to accommodate the API's
  [two-requests-per-second limit](https://www.behindthename.com/api/).
- The language selection is captured when generation starts. Changes made during
  loading apply to the next click.
- "Sorry, no match" appears after all selected languages return no name. Network,
  HTTP, and invalid JSON failures stop the search and show a retry message.
  Gender buttons stay disabled during the search and become available afterwards,
  including when a request fails.

Suggestions are associated with at least one selected language; usage across
every selected language is not guaranteed.
[Behind the Name's API](https://www.behindthename.com/api/help.php) supports one
`usage` filter and has no endpoint for complete name lists. Finding names shared
by all selected languages would require a suitable dataset or additional lookups.

### Responsive interface and visual fixes

- The card width, padding, spacing, and typography adapt to phones, tablets,
  landscape layouts, and desktop screens while retaining the gradient design.
- Names can wrap on narrow screens, and error messages use smaller, readable text.
  The centred loading indicator shares a reserved area with the name to prevent
  the layout from jumping during loading.
- Gender controls and language options have larger touch targets. The language
  picker fits the available width, selected languages wrap, and the menu can open
  above or below the input. Its 16px input text avoids automatic focus zoom on iOS.
- Selected-language labels are vertically centred beside their remove buttons.
- Matching SVG gender symbols replace font-dependent glyphs, keeping all three
  centred within their buttons. Hovering with a mouse changes their colour and
  makes their strokes bolder. Keyboard focus has a visible outline.

### TypeScript, dependencies, and tooling

- Migrated all components, helpers, language data, tests, and the Vite
  configuration to TypeScript. Components and their tests use `.tsx`; other
  source files use `.ts`.
- Enabled strict type checking, including null, indexed-access, optional-property,
  and override checks. Props, state, genders, and dropdown selections are typed;
  language-code types are derived from the options data. API responses are treated
  as unknown data and checked before displaying a name.
- Added `npm run typecheck` and made type checking a prerequisite for production
  builds. Type errors stop the build.
- Updated React and React DOM to version 19, React Select to version 5,
  `react-loader-spinner` to version 8, and the React Testing Library packages.
  Added TypeScript 7 and the React and Node type definitions, and regenerated
  the dependency lockfile.
- Replaced Create React App and its Webpack tooling with Vite 8. Development and
  production builds work on Node 20.19.5 without the OpenSSL legacy-provider flag.
- Replaced the Create React App test runner with Vitest 4 and jsdom 27. These
  versions retain compatibility with Node 20.19.5. Test tools and type definitions
  are development dependencies.
- Removed redundant promise tracking; the spinner uses the app's loading state.
  Replaced the tooltip dependency with native browser tooltips for language
  descriptions.
- Moved `index.html` to the project root and retained `build/` as the production
  output directory for Firebase Hosting. Removed unused Create React App service
  worker registration code while retaining unregistration of earlier workers.

### Verification

- All 17 tests pass, covering random language selection, gender filters, retries,
  exhausted selections, request failures, loading, and selecting or removing
  languages. Fetch mocks are typed and use real `Response` objects.
- Strict type checking and the production build pass.
- Chrome checks cover seven viewport sizes from 320 to 1440 px, including
  landscape, with loading, long names, errors, and multiple selected languages.
  Separate checks verify symbol and selected-language label alignment on mobile
  and desktop, plus bold hover styling on desktop.

## Development

Node.js must satisfy `^20.19.0 || >=22.12.0`, as specified in `package.json`.

| Command | Purpose |
| --- | --- |
| `npm ci` | Install dependencies from the lockfile. |
| `npm start` | Start Vite at http://localhost:3000 with automatic reloading. |
| `npm run typecheck` | Check source files, tests, and configuration without generating files. |
| `npm test` | Run the Vitest suite once with jsdom and mocked API requests. |
| `npm run test:watch` | Run tests in watch mode. |
| `npm run build` | Type-check the project and build production files in `build/`. |
| `npm run preview` | Preview the production build locally at the URL printed in the terminal. |

## Production build

Firebase Hosting continues to serve the `build/` directory. Static assets such as
icons, `robots.txt`, and `manifest.json` remain in `public/` and are copied into
the build. No service worker is generated; the app unregisters an existing worker
from earlier deployments.
