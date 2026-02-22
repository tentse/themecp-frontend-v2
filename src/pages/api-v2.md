# ThemeCP Backend V2 — API v2 (Frontend Docs)

## Base URL

- **Base path**: `/api/v2`
- **Swagger UI**: `/api/v2/docs`
- **ReDoc**: `/api/v2/redoc`

## Auth

This backend uses **JWT bearer tokens**.

- **Header**: `Authorization: Bearer <token>`
- **Token payload**: contains `email`
- **Expiration**: controlled by `ACCESS_TOKEN_EXPIRE_MINUTES` (default 43200 minutes = 30 days)

### Error shape

Most errors are returned as:

```json
{ "detail": "Some message" }
```

### Validation errors (FastAPI)

Invalid request bodies / missing required fields typically return **422** with FastAPI’s validation payload.

## Shared enums & types

### `ContestStatus`

- `REVIEW`: contest generated, not started yet
- `RUNNING`: contest started (has `starts_at`/`ends_at`)
- `FINISHED`: contest ended (result saved)

### `ProblemStatus`

- `UNSOLVED`
- `SOLVED`
- `UPSOLVED` (defined, but currently not produced by the services)

### Codeforces problem identity (important)

This API is **not consistent** in its casing for Codeforces IDs:

- In some places you’ll see **`contestID`** (capital `ID`) (ex: handle verification endpoints)
- In others you’ll see **`contestId`** (camelCase) (ex: contest session problems)

Treat these as the same “Codeforces contest id” concept in the frontend.

## Endpoints

### Health

#### GET `/api/v2/health`

- **Auth**: no
- **Response 200**:

```json
{ "status": "ok" }
```

---

### Authentication

#### POST `/api/v2/auth/register`

Create a new user account and return a JWT.

- **Auth**: no
- **Body**:

```json
{ "email": "user@example.com" }
```

- **Response 201**:

```json
{ "token": "<jwt>" }
```

- **Errors**:
  - **409**: `{ "detail": "User with this email already exists." }`
  - **422**: invalid request body
  - **503**: `{ "detail": "Database error occurred while registering user." }` (and other DB failures)

#### POST `/api/v2/auth/login`

Login by email and return a JWT.

Note: there is **no password** in this API; “login” means “issue a token for an existing email”.

- **Auth**: no
- **Body**:

```json
{ "email": "user@example.com" }
```

- **Response 200**:

```json
{ "token": "<jwt>" }
```

- **Errors**:
  - **401**: `{ "detail": "Unauthorized." }` (email not registered)
  - **422**: invalid request body
  - **503**: `{ "detail": "Database error occurred while fetching user." }`

---

### Users

#### GET `/api/v2/users`

Get the authenticated user’s profile and contest stats.

- **Auth**: yes (`Bearer` token)
- **Response 200**:

```json
{
  "id": "string",
  "email": "user@example.com",
  "codeforces_handle": "cf_handle_example",
  "rating": 1407,
  "max_contest_rating": 1407,
  "best_performance": 1500,
  "contest_attempts": 1,
  "rating_label": "Pupil"
}
```

Notes:
- If the user has **no finished contests**, then `rating`, `max_contest_rating`, `best_performance` are `null`, and `contest_attempts` is `0`, and `rating_label` is `"Unrated"`.

- **Errors**:
  - **401**: `{ "detail": "Invalid token" }` (JWT decode failed)
  - **401**: `{ "detail": "Unauthorized." }` (token valid but user missing in DB)
  - **503**: `{ "detail": "Database error occurred while fetching user." }`

#### GET `/api/v2/users/handle-verification-cf-problem`

Get a Codeforces problem for handle verification.

Frontend uses this to show the user a “verification problem” they must submit (see the next endpoint).

- **Auth**: yes
- **Query params**:
  - `codeforces_handle` (string, required)
- **Response 200** (`CodeforcesProblems`):

```json
{
  "contestID": "5000",
  "index": "A",
  "rating": 1000,
  "tags": ["greedy", "dp"]
}
```

How the backend chooses the problem:
- It fetches the user’s **latest** submission from Codeforces (`/user.status`) for the given handle.
- Then it fetches the full Codeforces problemset and returns the **first** problem where **both** `contestID` and `index` differ from that latest submission.

- **Errors**:
  - **401**: `{ "detail": "Invalid token" }`
  - **404**: `{ "detail": "Unsolved problem not found from codeforces" }` (no submissions returned by Codeforces for that handle)
  - **503**: `{ "detail": "Error occurred while fetching Codeforces problems." }`
  - **503**: `{ "detail": "Error occurred while fetching user's solved problems." }`

#### PUT `/api/v2/users/codeforces-handle`

Verify and save the authenticated user’s Codeforces handle.

Verification rule (important):
- The backend fetches the handle’s **latest** submission from Codeforces.
- It returns `true` and saves the handle only if:
  - the latest submission is for the provided (`contestID`, `index`), AND
  - the verdict is exactly `"COMPILATION_ERROR"`

So the frontend flow is typically:
1. Call `GET /users/handle-verification-cf-problem` to get a target problem.
2. Ask the user to submit a solution on Codeforces that intentionally causes **Compilation Error** (so it won’t count as solving).
3. Call this endpoint to confirm and save the handle.

- **Auth**: yes
- **Body**:

```json
{
  "codeforces_handle": "tourist",
  "contestID": "5000",
  "index": "A"
}
```

- **Response 200**:

```json
true
```

If verification fails (wrong problem or verdict not compilation error), the endpoint returns:

```json
false
```

- **Errors**:
  - **401**: `{ "detail": "Invalid token" }`
  - **404**: `{ "detail": "Unsolved problem not found from codeforces" }` (no submissions returned)
  - **409**: `{ "detail": "Codeforces handle already exists." }`
  - **409**: `{ "detail": "Codeforces handle already added." }`
  - **503**: `{ "detail": "Database error occurred while updating Codeforces handle." }`
  - **503**: `{ "detail": "Error occurred while fetching user's solved problems." }`

---

### Contest Levels

#### GET `/api/v2/contest-level`

Return all contest levels (difficulty presets), ordered by `level` ascending.

- **Auth**: no
- **Response 200**:

```json
[
  {
    "id": 1,
    "level": 20,
    "duration_in_min": 120,
    "performance": 1575,
    "p1_rating": 1000,
    "p2_rating": 1200,
    "p3_rating": 1400,
    "p4_rating": 1500
  }
]
```

- **Errors**:
  - **503**: `{ "detail": "Database error occurred while fetching contest level detail." }`

---

### Contest Themes

Contest themes are tags used when creating a contest session (e.g. `greedy`, `dp`). The backend normalizes theme names to lowercase on create and returns them in uppercase in list responses.

#### GET `/api/v2/contest-theme`

Return all contest themes. Themes are returned with `theme` in **uppercase**.

- **Auth**: no
- **Response 200**:

```json
[
  { "id": 1, "theme": "GREEDY" },
  { "id": 2, "theme": "DP" }
]
```

- **Errors**:
  - **503**: `{ "detail": "Database error occurred while fetching contest themes." }`

#### POST `/api/v2/contest-theme`

Create a new contest theme. The `theme` value is normalized to **lowercase** before storage. Duplicate theme names (case-insensitive) return 409.

- **Auth**: no
- **Body**:

```json
{ "theme": "greedy" }
```

- **Response 204**: **No Content**

- **Errors**:
  - **409**: `{ "detail": "Contest theme already exists" }`
  - **422**: invalid request body
  - **503**: `{ "detail": "Database error occurred while creating contest theme." }`

---

### Contest Sessions

Contest sessions are the main “play” object. Each user can have **at most one active session** at a time:
- Active means `status` is `REVIEW` or `RUNNING`.
- `POST /contest-session` will **return the existing active session** instead of creating a new one.

#### GET `/api/v2/contest-session`

Get the user’s active contest session (REVIEW or RUNNING).

- **Auth**: yes
- **Response 200** (`ContestSessionOutput`):

```json
{
  "id": "string",
  "status": "REVIEW",
  "duration_in_min": 120,
  "user_id": "string",
  "starts_at": null,
  "ends_at": null,
  "level": 21,
  "theme": "greedy",
  "p1": { "contestId": "5000", "index": "A", "rating": 1000 },
  "p2": { "contestId": "5000", "index": "B", "rating": 1200 },
  "p3": { "contestId": "5000", "index": "C", "rating": 1400 },
  "p4": { "contestId": "5000", "index": "D", "rating": 1600 }
}
```

- **Errors**:
  - **401**: `{ "detail": "Invalid token" }`
  - **404**: `{ "detail": "Contest session not found" }` (no active session)
  - **503**: `{ "detail": "Database error occurred while fetching contest session." }`

#### POST `/api/v2/contest-session`

Create a new contest session in `REVIEW` status (generates 4 problems).

Important behavior:
- If you already have an active session (`REVIEW` or `RUNNING`), this endpoint returns that session (still **201**) instead of creating another.

- **Auth**: yes
- **Body**:

```json
{ "level": 21, "theme": "greedy" }
```

- **Response 201** (`ContestSessionOutput`), same shape as GET above.

- **Errors**:
  - **400**: `{ "detail": "Codeforces handle not added." }`
  - **401**: `{ "detail": "Invalid token" }`
  - **503**: `{ "detail": "Error occurred while fetching Codeforces problems." }`
  - **503**: `{ "detail": "Database error occurred while saving contest session." }`

#### PUT `/api/v2/contest-session/{contest_session_id}/re-roll-problem/{problem_number}`

Re-roll a single problem in a contest session. Only allowed when the session is in **REVIEW** status (before start). The backend replaces the problem at the given slot with a new one (same theme/level, excluding already-seen problems).

- **Auth**: yes
- **Path**:
  - `contest_session_id` (string)
  - `problem_number` (int, 1–4: problem slot to re-roll)
- **Response 200** (`ContestSessionOutput`), same shape as GET/POST above (session with updated problem at that slot).

- **Errors**:
  - **400**: `{ "detail": "Invalid problem number." }` (`problem_number` not in 1–4)
  - **401**: `{ "detail": "Invalid token" }`
  - **404**: `{ "detail": "Contest session not found" }`
  - **409**: `{ "detail": "Contest session is not in REVIEW status." }`
  - **503**: `{ "detail": "Database error occurred while updating contest session problem." }`

#### DELETE `/api/v2/contest-session/{contest_session_id}`

Delete a contest session. Only allowed when the session is in **REVIEW** status (before start). After deletion, the user has no active session and can create a new one.

- **Auth**: yes
- **Path**:
  - `contest_session_id` (string)
- **Response 204**: **No Content**

- **Errors**:
  - **401**: `{ "detail": "Invalid token" }`
  - **404**: `{ "detail": "Contest session not found" }`
  - **409**: `{ "detail": "Contest session is not in REVIEW status." }`
  - **503**: `{ "detail": "Database error occurred while deleting contest session." }`

#### PUT `/api/v2/contest-session/{contest_session_id}/start`

Start a contest session. Backend sets:
- `status` → `RUNNING`
- `starts_at` → now + **15 seconds** (countdown)
- `ends_at` → `starts_at + duration_in_min * 60`
- creates 4 `contest_session_problems_status` rows (all `UNSOLVED`)

- **Auth**: yes
- **Path**:
  - `contest_session_id` (string)
- **Response 200** (`ContestSessionOutput`), but now includes `starts_at` and `ends_at`:

```json
{
  "id": "string",
  "status": "RUNNING",
  "duration_in_min": 120,
  "user_id": "string",
  "starts_at": 1730000000,
  "ends_at": 1730007200,
  "level": 21,
  "theme": "greedy",
  "p1": { "contestId": "5000", "index": "A", "rating": 1000 },
  "p2": { "contestId": "5000", "index": "B", "rating": 1200 },
  "p3": { "contestId": "5000", "index": "C", "rating": 1400 },
  "p4": { "contestId": "5000", "index": "D", "rating": 1600 }
}
```

- **Errors**:
  - **401**: `{ "detail": "Invalid token" }`
  - **404**: `{ "detail": "Contest session not found" }` (wrong id or belongs to someone else)
  - **409**: `{ "detail": "Contest session is already in RUNNING status." }`
  - **503**: `{ "detail": "Database error occurred while starting contest session." }`

#### PUT `/api/v2/contest-session/{contest_session_id}/refresh`

Refresh problem solve statuses for a running contest by checking Codeforces submissions.

Rules:
- Only submissions with `verdict == "OK"` count.
- Only submissions with `creationTimeSeconds >= starts_at` count.
- **Solve order is enforced**: problem \(n\) is marked solved only if all problems `< n` are already solved.
- For each problem, the backend records the **earliest accepted submission time** and computes `solved_in_min = floor((accepted_time - starts_at) / 60)`.

- **Auth**: yes
- **Path**:
  - `contest_session_id` (string)
- **Response 200** (`ContestSessionProblemsStatus`):

```json
{
  "contest_session_id": "string",
  "starts_at": 1730000000,
  "ends_at": 1730007200,
  "p1": { "contestId": "5000", "index": "A", "rating": 1000 },
  "p2": { "contestId": "5000", "index": "B", "rating": 1200 },
  "p3": { "contestId": "5000", "index": "C", "rating": 1400 },
  "p4": { "contestId": "5000", "index": "D", "rating": 1600 },
  "p1_status": "SOLVED",
  "p2_status": "UNSOLVED",
  "p3_status": "UNSOLVED",
  "p4_status": "UNSOLVED"
}
```

- **Errors**:
  - **401**: `{ "detail": "Invalid token" }`
  - **404**: `{ "detail": "Contest session not found" }`
  - **409**: `{ "detail": "Contest session is not in RUNNING status." }`
  - **503**: `{ "detail": "Error occurred while fetching user's solved problems." }`
  - **503**: `{ "detail": "Database error occurred while fetching problem statuses." }`
  - **503**: `{ "detail": "Database error occurred while updating problem status." }`

#### PUT `/api/v2/contest-session/{contest_session_id}/end`

End a running contest session.

What happens server-side:
1. Auto-refreshes statuses (same logic as `/refresh`)
2. Calculates `performance` (based on level, problem ratings, solve times)
3. Calculates rating update
4. Saves contest result and updates user stats
5. Marks session `FINISHED`

- **Auth**: yes
- **Response 204**: **No Content**

- **Errors**:
  - **401**: `{ "detail": "Invalid token" }`
  - **404**: `{ "detail": "Contest session not found" }`
  - **409**: `{ "detail": "Contest session is not in RUNNING status." }`
  - **503**: `{ "detail": "Database error occurred while saving contest result." }` (and other DB errors)
  - **503**: `{ "detail": "Error occurred while fetching user's solved problems." }`

#### GET `/api/v2/contest-session/history`

Get the user’s contest history (FINISHED sessions only), paginated, latest first.

- **Auth**: yes
- **Query params**:
  - `skip` (int, default `0`, min `0`)
  - `limit` (int, default `10`, min `1`, max `50`)
- **Response 200** (`ContestHistoryOutput`):

```json
{
  "items": [
    {
      "session_id": "string",
      "date": "2026-02-19",
      "level": 21,
      "theme": "greedy",
      "duration_in_min": 120,
      "performance": 1193,
      "rating": 1386,
      "rating_delta": -14,
      "p1": { "contestId": "5000", "index": "A", "rating": 1000 },
      "p2": { "contestId": "5000", "index": "B", "rating": 1200 },
      "p3": { "contestId": "5000", "index": "C", "rating": 1400 },
      "p4": { "contestId": "5000", "index": "D", "rating": 1600 },
      "p1_status": "SOLVED",
      "p2_status": "UNSOLVED",
      "p3_status": "UNSOLVED",
      "p4_status": "UNSOLVED",
      "p1_solved_in_min": 5,
      "p2_solved_in_min": null,
      "p3_solved_in_min": null,
      "p4_solved_in_min": null
    }
  ],
  "skip": 0,
  "limit": 10,
  "total": 1
}
```

Notes:
- `date` is derived from `starts_at` in **UTC**, formatted `YYYY-MM-DD`.
- `pN_solved_in_min` is minutes from contest start to first AC for that problem; `null` if not solved.
- Sessions in `REVIEW` or `RUNNING` are **not included**.

- **Errors**:
  - **401**: `{ "detail": "Invalid token" }`
  - **503**: `{ "detail": "Database error occurred while fetching contest history." }`

---

## Frontend integration notes

### Recommended contest UI state machine

1. **No active session** → show “Create contest”
2. **REVIEW** → show problems + “Start” button
3. **RUNNING** → show countdown/clock; poll refresh; show per-problem status
4. **FINISHED** → redirect to history / results screen (note: `/end` returns 204)

### Copy/paste frontend flows

#### 1) Register / login (store token)

Register:

```bash
curl -sS -X POST "http://localhost:8000/api/v2/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

Login (same payload shape):

```bash
curl -sS -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

Frontend: store `token` and send it as `Authorization: Bearer <token>` for all protected endpoints.

#### 2) Add & verify Codeforces handle (compilation-error trick)

Step A — ask backend for a verification problem:

```bash
curl -sS -X GET "http://localhost:8000/api/v2/users/handle-verification-cf-problem?codeforces_handle=tourist" \
  -H "Authorization: Bearer $TOKEN"
```

Step B — show the user the problem link and instructions:
- Open the Codeforces problem URL (see “Building Codeforces links” below).
- Submit any code that causes **Compilation Error**.
- Wait a few seconds for Codeforces to update submissions.

Step C — verify & save handle:

```bash
curl -sS -X PUT "http://localhost:8000/api/v2/users/codeforces-handle" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"codeforces_handle":"tourist","contestID":"5000","index":"A"}'
```

If you get `false`, the user’s latest submission doesn’t match the problem or verdict yet (or they didn’t submit compilation error).

#### 3) Contest lifecycle

Step A — create contest (generates 4 problems, `REVIEW` state):

```bash
curl -sS -X POST "http://localhost:8000/api/v2/contest-session" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"level":21,"theme":"greedy"}'
```

Optional — re-roll a problem (only in `REVIEW`; replace problem at slot 1–4):

```bash
curl -sS -X PUT "http://localhost:8000/api/v2/contest-session/$SESSION_ID/re-roll-problem/2" \
  -H "Authorization: Bearer $TOKEN"
```

Optional — discard session (only in `REVIEW`; returns **204** no content):

```bash
curl -sS -X DELETE "http://localhost:8000/api/v2/contest-session/$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Step B — start contest (15s countdown; switches to `RUNNING` and sets `starts_at`/`ends_at`):

```bash
curl -sS -X PUT "http://localhost:8000/api/v2/contest-session/$SESSION_ID/start" \
  -H "Authorization: Bearer $TOKEN"
```

Step C — poll refresh during contest:

```bash
curl -sS -X PUT "http://localhost:8000/api/v2/contest-session/$SESSION_ID/refresh" \
  -H "Authorization: Bearer $TOKEN"
```

Step D — end contest:

```bash
curl -i -X PUT "http://localhost:8000/api/v2/contest-session/$SESSION_ID/end" \
  -H "Authorization: Bearer $TOKEN"
```

Expected: **204** and an empty body. In the frontend, do **not** call `response.json()` for this request.

Step E — after ending, refresh UI data:
- Call `GET /api/v2/users` to refresh rating + stats
- Call `GET /api/v2/contest-session/history?skip=0&limit=10` to show latest finished contest

### Polling `/refresh`

Suggested approach:
- Poll every 5–10 seconds while `RUNNING`
- Stop polling once all four problems are `SOLVED` or `now > ends_at`

### Building Codeforces links

Contest problems only include `contestId` + `index`. Build URLs like:

`https://codeforces.com/problemset/problem/<contestId>/<index>`

Example: `https://codeforces.com/problemset/problem/5000/A`

---

## TypeScript types (copy/paste)

These mirror the backend’s Pydantic response models. Watch for `contestID` vs `contestId`.

```ts
export type ApiError = { detail: string };

// ---------- Auth ----------
export type Credentials = { email: string };
export type AuthResponse = { token: string };

// ---------- Users ----------
export type UserResponse = {
  id: string;
  email: string;
  codeforces_handle: string | null;
  rating: number | null;
  max_contest_rating: number | null;
  best_performance: number | null;
  contest_attempts: number;
  rating_label: string; // "Unrated" | "Newbie" | ...
};

// Codeforces handle verification responses use contestID (capital ID)
export type CodeforcesProblemForVerification = {
  contestID: string;
  index: string;
  rating: number;
  tags: string[];
};

export type CodeforcesHandleUpdate = {
  codeforces_handle: string;
  contestID: string;
  index: string;
};

// ---------- Contest levels ----------
export type ContestLevel = {
  id: number;
  level: number;
  duration_in_min: number;
  performance: number;
  p1_rating: number;
  p2_rating: number;
  p3_rating: number;
  p4_rating: number;
};

// ---------- Contest themes ----------
export type ContestThemeOutput = {
  id: number;
  theme: string; // uppercase in API response
};

export type ContestThemeInput = {
  theme: string; // normalized to lowercase on server
};

// ---------- Contest sessions ----------
export type ContestStatus = "REVIEW" | "RUNNING" | "FINISHED";
export type ProblemStatus = "UNSOLVED" | "SOLVED" | "UPSOLVED";

// Contest session problems use contestId (camelCase)
export type ProblemDetail = {
  contestId: string;
  index: string;
  rating: number;
};

export type ContestSessionInput = {
  level: number;
  theme: string;
};

export type ContestSessionOutput = {
  id: string;
  status: ContestStatus;
  duration_in_min: number;
  user_id: string;
  starts_at: number | null; // unix seconds
  ends_at: number | null; // unix seconds
  level: number;
  theme: string;
  p1: ProblemDetail;
  p2: ProblemDetail;
  p3: ProblemDetail;
  p4: ProblemDetail;
};

export type ContestSessionProblemsStatus = {
  contest_session_id: string;
  starts_at: number; // unix seconds
  ends_at: number; // unix seconds
  p1: ProblemDetail;
  p2: ProblemDetail;
  p3: ProblemDetail;
  p4: ProblemDetail;
  p1_status: ProblemStatus;
  p2_status: ProblemStatus;
  p3_status: ProblemStatus;
  p4_status: ProblemStatus;
};

export type ContestHistoryItem = {
  session_id: string;
  date: string; // YYYY-MM-DD (UTC)
  level: number;
  theme: string;
  duration_in_min: number;
  performance: number;
  rating: number;
  rating_delta: number;
  p1: ProblemDetail;
  p2: ProblemDetail;
  p3: ProblemDetail;
  p4: ProblemDetail;
  p1_status: ProblemStatus;
  p2_status: ProblemStatus;
  p3_status: ProblemStatus;
  p4_status: ProblemStatus;
  p1_solved_in_min: number | null;
  p2_solved_in_min: number | null;
  p3_solved_in_min: number | null;
  p4_solved_in_min: number | null;
};

export type ContestHistoryOutput = {
  items: ContestHistoryItem[];
  skip: number;
  limit: number;
  total: number;
};

export function codeforcesProblemUrl(p: { contestId: string; index: string }): string {
  return `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`;
}
```

