## First React project - Name your bébé!
Developed during the Frameworks and Architectures for the Web course in Spring 2020 at the IT University of Copenhagen

Accessible via https://name-your-bebe.web.app/

When several languages are selected, each click tries them in a random order
until a name is found. Each language is tried at most once, with the same gender
throughout. "Sorry, no match" appears only after all selected languages return
no name. Suggestions belong to at least one selected language; they are not
guaranteed to be used in all selected languages. With no selection, one request
uses the API's default usage.

Retries wait 550 ms after an empty response to respect the API's
[two-requests-per-second limit](https://www.behindthename.com/api/). Network,
HTTP, and invalid JSON failures stop the search and show a retry message.

[Behind the Name's API](https://www.behindthename.com/api/help.php) accepts a
single `usage` filter and does not offer a full name-list endpoint. Finding names
shared by all selected languages would require a dataset with gender and multiple
usage tags, or bounded random sampling followed by individual name lookups. The
latter can miss valid matches and uses more of the API request quota.

---

The app uses TypeScript, React, Vite, and Vitest. Node.js 20.19+ or 22.12+ is required
(see `package.json` for the exact supported range). Use a supported Node LTS
release for ongoing development. The OpenSSL legacy-provider flag is no longer
needed.

## Development

Run `npm ci` to install the dependencies from the lockfile, then `npm start` to
start the development server at http://localhost:3000. Vite reloads the app as
you edit source files. Components and their tests use `.tsx`; other source files
and the Vite configuration use `.ts`.

Run `npm run typecheck` to check all source files, tests, and the Vite configuration
without generating files. TypeScript strict mode is enabled, including null and
indexed-access checks. Language codes are derived from the options data, and API
responses are validated at runtime before names are displayed.

## Tests

Run `npm test` for a single test run, or `npm run test:watch` for watch mode.
Vitest uses jsdom and React Testing Library; API requests are mocked in tests.

## Production build

Run `npm run build` to type-check the project and create production files in
`build/`. A type error stops the build. This keeps the
existing Firebase Hosting configuration compatible. Run `npm run preview` to
preview that build locally; the command prints the preview URL.

Vite uses the root `index.html` as its entry point. Static assets such as icons,
`robots.txt`, and `manifest.json` remain in `public/` and are copied into the
build. No service worker is generated; the app unregisters an existing worker
from earlier deployments.

## Dependency compatibility

React and React DOM are upgraded together. Test-only dependencies are in
`devDependencies`. Vitest 4 and jsdom 27 are used because the newest
versions require Node 22; these versions also support the installed Node 20.19.5.
