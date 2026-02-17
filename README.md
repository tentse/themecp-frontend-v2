# ThemeCP Frontend

ThemeCP is a competitive programming training platform that integrates with Codeforces. Users train on a perpetual ladder (rating 800–3500) through two-hour, four-problem mashup contests, ideally done daily. This repository is the frontend application.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build and dev server
- **Tailwind CSS v4** for styling
- **React Router v6** for routing
- **Highcharts** for rating and theme distribution charts
- **Google OAuth** (via `@react-oauth/google`) for authentication

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm (or yarn/pnpm)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd themecp-frontend-v2

# Install dependencies
npm install
```

### Environment Setup

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set the required variables:

   | Variable | Description | Example |
   |----------|--------------|---------|
   | `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` or `https://api.themecp.com` |
   | `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (Web application) | `xxxx.apps.googleusercontent.com` |
   | `VITE_GA4_ID` | Google Analytics 4 measurement ID (optional) | `G-XXXXXXXXXX` |

3. For local development, the API falls back to `http://localhost:8000` if `VITE_API_BASE_URL` is not set. For production, always set it explicitly.

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next free port).

### Build for Production

```bash
npm run build
```

Output is written to the `dist/` directory. Use `npm run preview` to serve the production build locally.

---

## Project Structure

```
src/
├── api/                    # API client and service modules
│   ├── client.ts           # Fetch wrapper (auth header, error handling)
│   ├── types.ts            # TypeScript interfaces for API requests/responses
│   ├── auth.ts             # login(), register()
│   ├── users.ts            # getProfile(), getVerificationProblem(), updateHandle()
│   ├── contestLevel.ts     # getLevels()
│   └── contestSession.ts   # getSession(), create(), start(), refresh(), end(), getHistory()
├── components/             # Reusable UI components
│   ├── layout/            # Navbar, Layout, ProfileLayout, ProfileTabs
│   ├── AddHandle.tsx      # Codeforces handle verification flow
│   ├── CountdownTimer.tsx # Reusable countdown (target timestamp)
│   ├── RatingBadge.tsx    # Colored rating badge
│   ├── RatingGraph.tsx    # Highcharts rating over time
│   ├── PieChart.tsx       # Theme distribution pie chart
│   └── Donation.tsx        # Donation / support section
├── contexts/               # React context providers
│   ├── AuthContext.tsx    # Token, user profile, login/logout
│   └── LevelContext.tsx   # Contest levels (public data)
├── hooks/
│   └── useContestSession.ts  # Contest page state machine logic
├── pages/                  # Route-level components
│   ├── HomePage.tsx
│   ├── GuidePage.tsx
│   ├── LevelsPage.tsx     # Contest level table
│   ├── ContestPage.tsx    # Unified contest flow (create/review/run/result)
│   ├── LoginPage.tsx
│   ├── ProfilePage.tsx
│   ├── ContestHistoryPage.tsx
│   ├── ImportExportPage.tsx
│   └── PrivacyPolicyPage.tsx
├── utils/                  # Shared utilities
│   ├── rating.ts          # getRatingColor, getRatingLabel
│   ├── codeforces.ts      # buildCodeforcesUrl
│   └── time.ts            # formatCountdown, formatDuration
├── constants/
│   └── tags.ts            # THEME_TAGS (theme dropdown options)
├── assets/                 # Images and static assets
├── App.tsx
└── main.tsx
```

---

## Architecture

### API Layer

All backend calls go through `src/api/client.ts`. It:

- Uses `VITE_API_BASE_URL` for the base URL
- Reads the JWT from `localStorage.getItem('token')`
- Adds `Authorization: Bearer <token>` for protected routes
- Throws typed errors with `detail` from the response body
- Clears the token on 401 responses

Service modules in `src/api/` encapsulate each domain (auth, users, contest-level, contest-session). See [FRONTEND_API_DOCUMENTATION.md](./FRONTEND_API_DOCUMENTATION.md) for backend API details.

### State Management

- **AuthContext**: Holds `token`, `user` (full profile from `GET /users`), `loading`, and methods `login`, `logout`, `refetchUser`. Replaces the need for a separate profile context.
- **LevelContext**: Fetches `GET /contest-level` on mount and exposes `levels` (public data, no auth).

### Routing

- **Layout**: Wraps all routes with the Navbar.
- **ProfileLayout**: Renders profile sub-tabs (Profile, Contest History, Import/Export) and an `<Outlet />` for nested content.
- **PrivateRoute**: Renders children only when `isAuthenticated`; otherwise redirects to `/login`.

### Path Alias

The `@/` alias maps to `src/`, e.g. `import { useAuth } from '@/contexts/AuthContext'`. Defined in `vite.config.ts` and `tsconfig.json`.

---

## Main Flows

### Authentication

1. User clicks "Login" and signs in with Google.
2. Frontend decodes the Google JWT to obtain the user's email.
3. `POST /auth/login` with `{ email }`; on 401, `POST /auth/register` with `{ email }`.
4. JWT is stored in `localStorage` under the key `token`.
5. Profile is fetched via `GET /users` and stored in AuthContext.
6. User is redirected to `/profile`.

### Contest Session (State Machine)

| Phase | Description |
|-------|-------------|
| NO_SESSION | User selects level and theme, then clicks "Create Contest" (`POST /contest-session`). |
| REVIEW | Backend returns 4 problems. User reviews and clicks "Start Contest" (`POST /contest-session/start`). |
| COUNTDOWN | 15-second countdown until the contest starts. |
| RUNNING | Problem table with links, solve status (from `POST /contest-session/refresh`, polled every 30s), and timer. User ends via "End Contest" or when time runs out. |
| RESULT | Shows rating delta and summary. User clicks "Back to Contest" to return to NO_SESSION. |

### Codeforces Handle Verification

1. User enters their Codeforces handle and clicks "Find Problem".
2. Frontend calls `GET /users/handle-verification-cf-problem?codeforces_handle=<handle>`.
3. User opens the returned problem link and submits code that results in `COMPILATION_ERROR`.
4. User returns and clicks "Verify".
5. Frontend calls `PUT /users/codeforces-handle` with `{ codeforces_handle, contestID, index }`.
6. Backend verifies the submission and links the handle; frontend calls `refetchUser()`.

---

## Routes

| Path | Auth | Description |
|------|------|-------------|
| `/` | No | Home page |
| `/guide` | No | Guide on how to use ThemeCP |
| `/levels` | No | Level sheet (contest level table) |
| `/login` | No | Google OAuth login |
| `/privacy-policy` | No | Privacy policy |
| `/contest` | Yes | Contest flow (create, review, run, result) |
| `/profile` | Yes | User profile, rating graph, AddHandle |
| `/profile/history` | Yes | Contest history table |
| `/profile/import-export` | Yes | Import/Export placeholder (coming soon) |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

---

## Security

- **Never commit `.env` or any file containing real credentials.**
- The repository ignores `.env`, `.env.local`, and `.env.*.local`.
- `.env.example` contains only placeholder values. Copy it to `.env` and fill in real values locally.
- In CI/CD and hosted environments, set env vars via platform secrets (e.g. Vercel, Railway), not committed files.
- The JWT is stored in `localStorage` and sent with API requests. The backend is responsible for validation and expiry.

---

## Backend API Documentation

For endpoint details, request/response schemas, and business logic flows, see [FRONTEND_API_DOCUMENTATION.md](./FRONTEND_API_DOCUMENTATION.md).
