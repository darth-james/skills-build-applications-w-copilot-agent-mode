# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep rendering in the existing React route components; use the shared API client for all requests and expose accessible loading, empty, and error states. Preserve the existing React Router and Bootstrap structure.
- Logic tier decision: Keep HTTP handling in Express routes and capability behavior in the service layer. Return deliberate 4xx responses for invalid input or missing records, and keep response shapes aligned with the API contract.
- Data tier decision: Use the existing Mongoose models and seed script. Add required field validation and appropriate defaults; keep seeding idempotent and preserve records not owned by the exercise fixtures.
- Activity tracking approach: Validate both IDs and confirm the user and team exist before creating an activity. Store the referenced user and team, submitted type and minutes, computed points, and occurrence date; reject invalid references without exposing cast errors as 500 responses.
- Team management approach: List and create teams through the service layer, preserving names, mascots, and member references. Reject a missing name with 400.
- Leaderboard approach: Aggregate activity points by team, sort totals descending, and assign 1-based ranks in the API response.
- Workout suggestions approach: Find the user by email, use the fitness goal and recent activity to select matching workouts, and include a concise reason. Return a deliberate 4xx when no user matches.

## Test plan

Run the focused contract tests first; failures identify the tier or capability whose contract is not met. Run both builds after the implementation to catch TypeScript and bundling errors.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` (model validation, defaults, relationships, and idempotent seed behavior).
- API command: `npm run test:api --prefix octofit-tracker/backend` (HTTP status and response contracts, input/reference validation, leaderboard totals and ordering, and workout recommendations).
- Frontend command: `npm test --prefix octofit-tracker/frontend` (API-backed rendering and accessible loading, empty, and error states for every route).
- Backend build command: `npm run build --prefix octofit-tracker/backend` (backend TypeScript compilation errors).
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` (frontend TypeScript or Vite production-build errors).

Starter baseline observed before implementation: the backend suite had 8 failing tests and 1 passing seed test; the frontend suite had 15 failing tests. These failures are expected for the incomplete starter scaffold, as described in [exercise validation](exercise-validation.md).
