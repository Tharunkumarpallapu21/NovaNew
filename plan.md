# ContextRoute AI implementation plan

## Product scope
Implement the approved CAIRRS MVP as a mobile-first Expo Router application using the supplied wireframe as the UI/UX reference. The application preserves the PRD's context-aware routing, road-quality scoring, POI enrichment, emergency diversion, hazard reporting, and resilience requirements. Live external providers remain seams; deterministic fixtures are explicitly labeled Demo data in development builds.

## Architecture
- `lib/domain/models.ts`: typed traveler context, routes, POIs, hospitals, hazards, reports, settings and screen state.
- `lib/domain/useCases.ts`: pure route scoring, context preset selection, POI detour injection, emergency diversion, report creation/consensus and offline queue behavior.
- `lib/data/mockData.ts`: development fixture data for road segments, candidate routes, POIs, hospitals and reports.
- `lib/data/routeRepository.ts`: repository contract plus deterministic local data source; exposes loading, provider unavailable and offline semantics without pretending live routing is active.
- `hooks/use-context-route-view-model.ts`: screen state, commands and derived state for the connected user flows.
- `components/context-route-ui.tsx`: reusable brand primitives, map mock, cards, bottom navigation and state banners.
- `app/(tabs)/index.tsx`: thin composition root that renders planner, routes, navigation, explore, reports, saved places, profile/settings, onboarding and explicit resilience states.

## Design
- **Design movement:** calm mobility utility, blending clinical safety clarity with warm travel discovery.
- **Core principles:** safety is visible; every decision is explainable; one-handed interactions; resilient states are first-class.
- **Color philosophy:** ContextRoute blue communicates dependable navigation, teal signals healthy road quality, amber indicates caution, and red is reserved for emergency actions.
- **Layout paradigm:** vertically stacked, card-led flows with a persistent action rail and a map surface used as spatial context rather than decoration.
- **Signature elements:** route-quality pills, explainability callouts, and a compact bottom navigation with persistent emergency access.
- **Interaction philosophy:** toggles and cards update the route model immediately; destructive or safety-sensitive actions use explicit labels and confirmations.
- **Animation:** restrained fades/spinners for loading; no distracting motion during active navigation.
- **Typography:** platform system typography with large readable headings, strong numeric metrics and compact helper copy.
- **Brand essence:** personalized, safer, smarter travel planning for people whose context matters.

## Build workflow
Run `pnpm check`, `pnpm lint`, `pnpm test`, and the Expo/API development listeners. Native APK/AAB compilation is handed to the managed Dashboard because release builds are not supported inside the Sandbox; only an actual build result will be called an APK.
