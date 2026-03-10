# SkillSwap Platform (Angular Frontend)

Production-quality Angular frontend for the SkillSwap midterm marketplace project.

## Tech Stack

- Angular 21 (standalone components, strict TypeScript)
- Angular Router
- Reactive Forms
- HttpClient + interceptor-based JWT handling
- SCSS

## Backend API

- Base URL: `https://stingray-app-wxhhn.ondigitalocean.app`
- Protected calls use `Authorization: Bearer <token>`
- No mock backend is used in this project.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm start
   ```
3. Build production bundle:
   ```bash
   npm run build
   ```

## Environment Configuration

- Development: [`src/environments/environment.development.ts`](/e:/Categories/College/Winter%202026/Trends%20In%20Tech/Midterm/SkillSwap/src/environments/environment.development.ts)
- Production: [`src/environments/environment.ts`](/e:/Categories/College/Winter%202026/Trends%20In%20Tech/Midterm/SkillSwap/src/environments/environment.ts)

Both point to the live backend API base URL above.

## Implemented Architecture

```
src/app/
  core/
    config/
    guards/
    interceptors/
    models/
    services/
    utils/
  shared/
    components/
  features/
    auth/
    dashboard/
    jobs/
    proposals/
    platform/
    users/
  layout/
```

### Core Services

- `AuthService`: register/login/logout/session restore
- `UsersService`: `/users/me`, `/users/:username`
- `JobsService`: search/create/get/update/my-postings/complete
- `ProposalsService`: submit/list/accept/my-bids/withdraw
- `ReviewsService`: submit/list user reviews
- `PlatformService`: platform statistics
- `NotificationService`: global toast system
- `LoadingService`: global request activity indicator
- `StorageService`: JWT persistence

### Security + Routing

- `authGuard` for protected routes
- `guestGuard` for login/register routes
- `authInterceptor`:
  - attaches JWT automatically
  - handles `401` by clearing session and redirecting to login
- `loadingInterceptor`: global top loading bar for HTTP traffic

## Pages and Flows

### Public

- `/` Home (hero, platform stats, open jobs preview)
- `/jobs` Browse/search jobs (filters: category/status/min budget)
- `/users/:username` Public profile + reviews section

### Auth

- `/register` (full validation, skills chips input, suggested username handling)
- `/login` (JWT login, redirect support)

### Protected

- `/dashboard` summary cards + quick links + previews
- `/me` current user profile
- `/jobs/new` create job
- `/jobs/:id` job details + context-aware actions
- `/jobs/:id/edit` update job fields + status
- `/jobs/:id/proposals` owner proposal management + accept action
- `/my-postings` all posted jobs
- `/my-bids` all submitted bids + withdraw pending bids

## Validation and Error Handling

- Strong client-side validation for all forms
- Backend-driven errors displayed via inline banners/toasts
- Explicit handling for `400`, `401`, `403`, `404`, `409`
- Register conflicts show backend `suggested_username` when present
- Search empty state is distinct from API error state

## Mandatory Business Flow Coverage

This UI supports the full required demo flow:

1. User A registers
2. User A logs in
3. User A posts a job
4. User B registers
5. User B submits a proposal
6. User A accepts proposal
7. Job moves to `in_progress`
8. Owner or freelancer marks job completed
9. Both participants submit reviews
10. Updated rating appears via backend-calculated fields

## API Shape Assumptions (Confirmed Against Live Backend)

- `POST /jobs` returns `{ message, job_id }` (not full job object)
- `POST /jobs/:id/proposals` returns `{ message, proposal_id }`
- `POST /jobs/:id/reviews` returns `{ message, review_id }`
- `GET /reviews/user/:id` currently expects auth in live behavior
- Errors generally return `{ error: "..." }`, sometimes with extra fields

If backend payload keys change, only small mapping tweaks in `core/services/*` should be required.

## Verification Status

- `npm run build` passes successfully (production build).

## Optional Commit Plan

1. `chore: scaffold strict angular standalone project`
2. `feat(core): add models services guards interceptors session handling`
3. `feat(public): home jobs browse and public profiles with reviews`
4. `feat(authenticated): dashboard jobs proposals bids and review flow`
5. `style(ui): responsive polish loading states toasts and shared components`
6. `docs: add architecture and business flow verification checklist`

