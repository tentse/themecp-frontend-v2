# ThemeCP Frontend

ThemeCP is a competitive programming training platform that integrates with Codeforces. Users train on a perpetual ladder (rating 800–3500) through two-hour, four-problem mashup contests, ideally done daily. This repository is the frontend application.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build and dev server
- **Tailwind CSS v4** for styling
- **React Router v6** for routing
- **Highcharts** for rating and theme distribution charts
- **Auth0** (via `@auth0/auth0-react`) for authentication

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
   | `VITE_AUTH0_DOMAIN` | Auth0 tenant domain | `your-tenant.us.auth0.com` |
   | `VITE_AUTH0_CLIENT_ID` | Auth0 application client ID | `your-auth0-client-id` |
   | `VITE_AUTH0_AUDIENCE` | Auth0 API identifier (optional) | `https://your-api-identifier` |
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
