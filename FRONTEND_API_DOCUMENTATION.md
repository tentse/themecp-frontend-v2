# ThemeCP Backend V2 - Frontend API Documentation

This document provides everything a frontend developer needs to integrate with the ThemeCP Backend API. ThemeCP is a competitive programming platform that integrates with Codeforces for problem fetching and verification.

---

## Table of Contents

1. [Overview and Base URL](#1-overview-and-base-url)
2. [Authentication](#2-authentication)
3. [API Endpoints Reference](#3-api-endpoints-reference)
4. [Per-Endpoint Documentation](#4-per-endpoint-documentation)
5. [Request/Response Schemas](#5-requestresponse-schemas)
6. [Business Logic Flows](#6-business-logic-flows)
7. [Error Responses](#7-error-responses)
8. [Codeforces Problem URLs](#8-codeforces-problem-urls)
9. [Rating Labels](#9-rating-labels)

---

## 1. Overview and Base URL

- **Base URL:** `{BASE_URL}` (e.g. `http://localhost:8000` for local development, or `https://api.themecp.com` for production)
- **API prefix:** All endpoints below are relative to the base. If the server is configured with `/api/v2` prefix, use `{BASE_URL}/api/v2` as the base.
- **Health check:** `GET /health` - Returns `{"status": "ok"}` when the server is running.
- **CORS:** Enabled for all origins, with credentials allowed. Include `credentials: 'include'` when making requests from the browser.
- **Interactive docs:** When the server is running:
  - Swagger UI: `{BASE_URL}/docs`
  - ReDoc: `{BASE_URL}/redoc`

---

## 2. Authentication

- **Type:** JWT Bearer tokens
- **Header:** `Authorization: Bearer <token>`
- **Token expiry:** 43,200 minutes (~30 days) by default
- **Algorithm:** HS256

All protected endpoints require the `Authorization` header with a valid JWT. Unauthenticated or invalid token requests return `401 Unauthorized` with `{"detail": "Invalid token"}`.

---

## 3. API Endpoints Reference

| Module        | Endpoint                                | Method | Auth | Description                            |
| ------------- | --------------------------------------- | ------ | ---- | -------------------------------------- |
| Auth          | `/auth/register`                        | POST   | No   | Register a new user                    |
| Auth          | `/auth/login`                           | POST   | No   | Login an existing user                  |
| Users         | `/users`                                | GET    | Yes  | Get current user profile                |
| Users         | `/users/handle-verification-cf-problem` | GET    | Yes  | Get Codeforces problem for handle verification |
| Users         | `/users/codeforces-handle`               | PUT    | Yes  | Update Codeforces handle after verification |
| Contest Level | `/contest-level`                         | GET    | No   | Get all contest levels                  |
| Contest Session | `/contest-session`                      | GET    | Yes  | Get active contest session              |
| Contest Session | `/contest-session`                      | POST   | Yes  | Create a new contest session           |
| Contest Session | `/contest-session/start`                | POST   | Yes  | Start the contest (15s countdown)        |
| Contest Session | `/contest-session/refresh`              | POST   | Yes  | Refresh problem solve status from Codeforces |
| Contest Session | `/contest-session/end`                  | POST   | Yes  | End the contest and calculate results   |
| Contest Session | `/contest-session/history`              | GET    | Yes  | Get contest history (paginated)         |

---

## 4. Per-Endpoint Documentation

### Authentication

#### POST /auth/register

**Role:** Registers a new user with email only (passwordless). Creates the user in the database and returns a JWT token for immediate authentication. Use this for first-time sign-up.

**Request:**
- **Method:** POST
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
  - `email` (string, required): Valid email format (EmailStr validation)

**Response:**
- **Success (201):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error (409):** `{"detail": "User with this email already exists."}`
- **Error (422):** Validation error (e.g. invalid email format)
- **Error (503):** `{"detail": "Database error occurred while registering user."}`

---

#### POST /auth/login

**Role:** Logs in an existing user by email. Returns a JWT token if the user exists. Use this for returning users who have already registered.

**Request:**
- **Method:** POST
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
  - `email` (string, required): Valid email format

**Response:**
- **Success (200):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error (401):** `{"detail": "Unauthorized."}` (user not found / not registered)
- **Error (422):** Validation error (invalid email format)
- **Error (503):** `{"detail": "Database error occurred while fetching user."}`

---

### Users

#### GET /users

**Role:** Returns the authenticated user's profile, including contest statistics (last rating, max rating, best performance, contest attempts) and rating label. Requires a valid JWT.

**Request:**
- **Method:** GET
- **Headers:** `Authorization: Bearer <token>`

**Response:**
- **Success (200):**
  ```json
  {
    "id": "abc123",
    "email": "user@example.com",
    "codeforces_handle": "cf_username",
    "last_contest_rating": 1400,
    "max_contest_rating": 1500,
    "best_performance": 1600,
    "contest_attempts": 5,
    "rating_label": "Pupil"
  }
  ```
  - `codeforces_handle` may be `null` if not yet verified
  - `last_contest_rating`, `max_contest_rating`, `best_performance` may be `null` if user has no finished contests
  - `rating_label` is "Unrated" when user has no contests
- **Error (401):** `{"detail": "Invalid token"}`

---

#### GET /users/handle-verification-cf-problem

**Role:** Returns a Codeforces problem that the user has NOT solved. This problem is used for handle verification: the user must submit code (resulting in COMPILATION_ERROR) to this problem on Codeforces to prove they own the handle. Required before calling `PUT /users/codeforces-handle`.

**Request:**
- **Method:** GET
- **Headers:** `Authorization: Bearer <token>`
- **Query parameters:**
  - `codeforces_handle` (string, required): The Codeforces handle to verify

**Response:**
- **Success (200):**
  ```json
  {
    "contestID": "1236",
    "index": "B",
    "rating": 1700,
    "tags": ["greedy", "dp"]
  }
  ```
  - Use `contestID` and `index` when calling `PUT /users/codeforces-handle`
  - Problem URL: `https://codeforces.com/problemset/problem/{contestID}/{index}`
- **Error (401):** `{"detail": "Invalid token"}`
- **Error (404):** `{"detail": "Unsolved problem not found from codeforces"}` (user has no submissions or all problems solved)
- **Error (503):** Codeforces API or database error

---

#### PUT /users/codeforces-handle

**Role:** Links a Codeforces handle to the authenticated user after verification. The user must have submitted code (with verdict COMPILATION_ERROR) to the problem returned by `GET /users/handle-verification-cf-problem`. The backend verifies the submission and links the handle.

**Request:**
- **Method:** PUT
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:**
  ```json
  {
    "codeforces_handle": "cf_username",
    "contestID": "1236",
    "index": "B"
  }
  ```
  - `codeforces_handle` (string): The Codeforces handle to link
  - `contestID` (string): Contest ID of the verification problem (from handle-verification-cf-problem)
  - `index` (string): Problem index (e.g. "A", "B") of the verification problem

**Response:**
- **Success (200):** `true` (verification successful, handle linked)
- **Success (200):** `false` (verification failed - user did not submit to the correct problem with COMPILATION_ERROR)
- **Error (401):** `{"detail": "Invalid token"}`
- **Error (404):** `{"detail": "Unsolved problem not found from codeforces"}`
- **Error (409):** `{"detail": "Codeforces handle already exists."}` (handle used by another user)
- **Error (409):** `{"detail": "Codeforces handle already added."}` (user already has a handle linked)
- **Error (503):** `{"detail": "Database error occurred while updating Codeforces handle."}`

---

### Contest Level

#### GET /contest-level

**Role:** Returns all contest levels ordered by level ascending. Used to populate level selection when creating a contest. No authentication required. Each level defines problem ratings (p1–p4), duration, and performance parameters.

**Request:**
- **Method:** GET
- **Headers:** None required

**Response:**
- **Success (200):**
  ```json
  [
    {
      "id": 1,
      "level": 20,
      "duration_in_min": 60,
      "performance": 1400,
      "p1_rating": 800,
      "p2_rating": 1000,
      "p3_rating": 1200,
      "p4_rating": 1400
    },
    {
      "id": 2,
      "level": 21,
      "duration_in_min": 120,
      "performance": 1600,
      "p1_rating": 1000,
      "p2_rating": 1200,
      "p3_rating": 1400,
      "p4_rating": 1600
    }
  ]
  ```
  - Returns empty array `[]` if no levels exist

---

### Contest Session

#### GET /contest-session

**Role:** Returns the user's active contest session (REVIEW or RUNNING status). If none exists, returns 404. Use this to load the current contest state when the user opens the contest page.

**Request:**
- **Method:** GET
- **Headers:** `Authorization: Bearer <token>`

**Response:**
- **Success (200):**
  ```json
  {
    "id": "session-abc123",
    "user_id": "user-xyz",
    "level": 21,
    "theme": "greedy",
    "duration_in_min": 120,
    "status": "REVIEW",
    "p1": {
      "contestID": "5000",
      "index": "A",
      "rating": 1000
    },
    "p2": {
      "contestID": "5000",
      "index": "B",
      "rating": 1200
    },
    "p3": {
      "contestID": "5000",
      "index": "C",
      "rating": 1400
    },
    "p4": {
      "contestID": "5000",
      "index": "D",
      "rating": 1600
    }
  }
  ```
  - `status` is one of: `"REVIEW"`, `"RUNNING"`, `"FINISHED"`
  - Problem URLs: `https://codeforces.com/problemset/problem/{contestID}/{index}`
- **Error (401):** `{"detail": "Invalid token"}`
- **Error (404):** `{"detail": "Contest session not found"}` (no active session)

---

#### POST /contest-session

**Role:** Creates a new contest session. The backend fetches 4 Codeforces problems matching the level and theme, stores them, and returns the session in REVIEW status. User can then review problems before starting. Fails if user already has an active session (REVIEW or RUNNING).

**Request:**
- **Method:** POST
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:**
  ```json
  {
    "level": 21,
    "theme": "greedy",
    "duration_in_min": 120
  }
  ```
  - `level` (integer, required): Contest level (use values from GET /contest-level)
  - `theme` (string, required): Problem theme/tag (e.g. "greedy", "dp", "graphs")
  - `duration_in_min` (integer, required): Contest duration in minutes

**Response:**
- **Success (201):** Same structure as GET /contest-session response
- **Error (401):** `{"detail": "Invalid token"}`
- **Error (409):** `{"detail": "Contest session already created and is in REVIEW or RUNNING status."}`
- **Error (503):** Database or Codeforces API error

---

#### POST /contest-session/start

**Role:** Transitions the contest session from REVIEW to RUNNING. Sets start time to 15 seconds from the request (for countdown). Creates problem status tracking records. Problems must be solved in order (P1, then P2, then P3, then P4).

**Request:**
- **Method:** POST
- **Headers:** `Authorization: Bearer <token>`

**Response:**
- **Success (200):**
  ```json
  {
    "session_id": "session-abc123",
    "status": "RUNNING",
    "starts_at": 1708012800,
    "duration_in_min": 120
  }
  ```
  - `starts_at` (integer): Unix timestamp in seconds when the contest officially starts (15 seconds from request)
  - Use `starts_at` for countdown and to determine if a submission is within the contest window
- **Error (401):** `{"detail": "Invalid token"}`
- **Error (404):** `{"detail": "No contest session in REVIEW status found"}` (no session or already RUNNING/FINISHED)

---

#### POST /contest-session/refresh

**Role:** Refreshes problem solve status by checking the user's Codeforces submissions. Problems are marked SOLVED only if solved in order (P1 before P2, etc.). Returns the updated status for all 4 problems. Call this periodically during a RUNNING contest to sync solve status.

**Request:**
- **Method:** POST
- **Headers:** `Authorization: Bearer <token>`

**Response:**
- **Success (200):**
  ```json
  [
    {
      "problem_number": 1,
      "state": "SOLVED",
      "accepted_at": "1708013100",
      "solved_in_min": 5
    },
    {
      "problem_number": 2,
      "state": "UNSOLVED",
      "accepted_at": null,
      "solved_in_min": null
    },
    {
      "problem_number": 3,
      "state": "UNSOLVED",
      "accepted_at": null,
      "solved_in_min": null
    },
    {
      "problem_number": 4,
      "state": "UNSOLVED",
      "accepted_at": null,
      "solved_in_min": null
    }
  ]
  ```
  - `problem_number`: 1, 2, 3, or 4
  - `state`: `"UNSOLVED"` or `"SOLVED"`
  - `accepted_at`: Unix timestamp string when accepted, or `null`
  - `solved_in_min`: Minutes from contest start when solved, or `null`
- **Error (401):** `{"detail": "Invalid token"}`
- **Error (404):** `{"detail": "No contest session in RUNNING status found."}`

---

#### POST /contest-session/end

**Role:** Ends the contest session. Auto-refreshes problem status, calculates performance and rating, saves the result, and transitions the session to FINISHED. Returns the final contest result including rating change.

**Request:**
- **Method:** POST
- **Headers:** `Authorization: Bearer <token>`

**Response:**
- **Success (200):**
  ```json
  {
    "session_id": "session-abc123",
    "status": "FINISHED",
    "solved_count": 2,
    "performance": 1350,
    "rating_before": 1400,
    "rating_after": 1407,
    "rating_delta": 7
  }
  ```
  - `solved_count`: Number of problems solved (0–4)
  - `performance`: Calculated performance based on solve times and problem ratings
  - `rating_before`: User's rating before this contest (1400 for first contest)
  - `rating_after`: New rating after this contest
  - `rating_delta`: Change in rating (can be negative)
- **Error (401):** `{"detail": "Invalid token"}`
- **Error (404):** `{"detail": "No contest session in RUNNING status found."}`

---

#### GET /contest-session/history

**Role:** Returns the user's contest history (FINISHED sessions only), paginated, latest first. Use for profile/history pages.

**Request:**
- **Method:** GET
- **Headers:** `Authorization: Bearer <token>`
- **Query parameters:**
  - `skip` (integer, optional): Number of items to skip. Default: 0, min: 0
  - `limit` (integer, optional): Max items to return. Default: 10, min: 1, max: 50

**Response:**
- **Success (200):**
  ```json
  {
    "items": [
      {
        "date": "2024-02-15",
        "level": 21,
        "theme": "greedy",
        "duration_in_min": 120,
        "solved_count": 2,
        "performance": 1350,
        "rating_after": 1407,
        "rating_delta": 7,
        "p1": { "contestID": "5000", "index": "A", "rating": 1000 },
        "p2": { "contestID": "5000", "index": "B", "rating": 1200 },
        "p3": { "contestID": "5000", "index": "C", "rating": 1400 },
        "p4": { "contestID": "5000", "index": "D", "rating": 1600 }
      }
    ],
    "skip": 0,
    "limit": 10,
    "total": 1
  }
  ```
  - `date`: YYYY-MM-DD from contest start time
  - `items`: Array of contest history entries (empty if none)
  - `total`: Total number of finished contests (for pagination)
- **Error (401):** `{"detail": "Invalid token"}`

---

## 5. Request/Response Schemas

### Credentials (Auth)
```json
{
  "email": "string"  // valid email
}
```

### AuthResponseModel
```json
{
  "token": "string"  // JWT
}
```

### UserResponseModel
```json
{
  "id": "string",
  "email": "string",
  "codeforces_handle": "string | null",
  "last_contest_rating": "int | null",
  "max_contest_rating": "int | null",
  "best_performance": "int | null",
  "contest_attempts": "int",
  "rating_label": "string"
}
```

### CodeforcesHandleUpdate
```json
{
  "codeforces_handle": "string",
  "contestID": "string",
  "index": "string"
}
```

### CreateContestSession
```json
{
  "level": "int",
  "theme": "string",
  "duration_in_min": "int"
}
```

### ProblemDetail
```json
{
  "contestID": "string",
  "index": "string",
  "rating": "int"
}
```

### ContestSessionResponseModel
```json
{
  "id": "string",
  "user_id": "string",
  "level": "int",
  "theme": "string",
  "duration_in_min": "int",
  "status": "REVIEW | RUNNING | FINISHED",
  "p1": "ProblemDetail",
  "p2": "ProblemDetail",
  "p3": "ProblemDetail",
  "p4": "ProblemDetail"
}
```

### StartContestResponse
```json
{
  "session_id": "string",
  "status": "RUNNING",
  "starts_at": "int",  // Unix timestamp seconds
  "duration_in_min": "int"
}
```

### RefreshProblemStatusResponse (array item)
```json
{
  "problem_number": "int",
  "state": "UNSOLVED | SOLVED",
  "accepted_at": "string | null",
  "solved_in_min": "int | null"
}
```

### EndContestResponse
```json
{
  "session_id": "string",
  "status": "FINISHED",
  "solved_count": "int",
  "performance": "int",
  "rating_before": "int",
  "rating_after": "int",
  "rating_delta": "int"
}
```

### ContestHistoryItem
```json
{
  "date": "string",  // YYYY-MM-DD
  "level": "int",
  "theme": "string",
  "duration_in_min": "int",
  "solved_count": "int",
  "performance": "int",
  "rating_after": "int",
  "rating_delta": "int",
  "p1": "ProblemDetail",
  "p2": "ProblemDetail",
  "p3": "ProblemDetail",
  "p4": "ProblemDetail"
}
```

### ContestHistoryResponse
```json
{
  "items": "ContestHistoryItem[]",
  "skip": "int",
  "limit": "int",
  "total": "int"
}
```

### ContestLevelOutput
```json
{
  "id": "int",
  "level": "int",
  "duration_in_min": "int",
  "performance": "int",
  "p1_rating": "int",
  "p2_rating": "int",
  "p3_rating": "int",
  "p4_rating": "int"
}
```

### CodeforcesProblems (handle verification)
```json
{
  "contestID": "string",
  "index": "string",
  "rating": "int",
  "tags": "string[]"
}
```

---

## 6. Business Logic Flows

### Codeforces Handle Verification Flow

1. User enters their Codeforces handle.
2. Frontend calls `GET /users/handle-verification-cf-problem?codeforces_handle={handle}`.
3. Backend returns a Codeforces problem the user has NOT solved.
4. Frontend displays the problem link: `https://codeforces.com/problemset/problem/{contestID}/{index}`.
5. User goes to Codeforces and submits any code to that problem (must result in COMPILATION_ERROR verdict).
6. User returns to the app and confirms verification.
7. Frontend calls `PUT /users/codeforces-handle` with `{ codeforces_handle, contestID, index }`.
8. Backend verifies the submission and links the handle. Returns `true` on success, `false` on failure.

### Contest Session Lifecycle

```
REVIEW → RUNNING → FINISHED
```

1. **REVIEW:** User creates session via `POST /contest-session`, reviews the 4 problems. Can start when ready.
2. **RUNNING:** User calls `POST /contest-session/start`. Contest starts 15 seconds later. User solves problems on Codeforces in order (P1, P2, P3, P4). Frontend can poll `POST /contest-session/refresh` to update solve status.
3. **FINISHED:** User calls `POST /contest-session/end`. Backend auto-refreshes, calculates performance and rating, saves result. User can create a new session.

**Important:** Problems must be solved in order. Problem 2 is only marked SOLVED if Problem 1 is already SOLVED.

---

## 7. Error Responses

All error responses use the format:
```json
{
  "detail": "string"
}
```

### HTTP Status Codes and Error Messages

| Status | Error Constant | Detail Message |
|--------|----------------|----------------|
| 401 | INVALID_TOKEN | Invalid token |
| 401 | UNAUTHORIZED | Unauthorized. |
| 404 | USER_NOT_FOUND | User not found |
| 404 | UNSOLVED_PROBLEM_NOT_FOUND | Unsolved problem not found from codeforces |
| 404 | CONTEST_SESSION_NOT_FOUND | Contest session not found |
| 404 | NO_SESSION_IN_REVIEW | No contest session in REVIEW status found |
| 404 | NO_SESSION_RUNNING | No contest session in RUNNING status found. |
| 409 | USER_ALREADY_EXISTS | User with this email already exists. |
| 409 | CONTEST_SESSION_ALREADY_ACTIVE | Contest session already created and is in REVIEW or RUNNING status. |
| 409 | CODEFORCES_HANDLE_ALREADY_EXISTS | Codeforces handle already exists. |
| 409 | CODEFORCES_HANDLE_ALREADY_ADDED | Codeforces handle already added. |
| 422 | Validation | Pydantic validation errors (invalid request body/params) |
| 503 | DB_ERROR_* | Database error occurred while ... |
| 503 | CODEFORCES_ERROR_* | Error occurred while fetching ... |

---

## 8. Codeforces Problem URLs

To build a link to a Codeforces problem, use:

```
https://codeforces.com/problemset/problem/{contestID}/{index}
```

Example: For `contestID: "5000"`, `index: "A"`:
```
https://codeforces.com/problemset/problem/5000/A
```

---

## 9. Rating Labels

Use these labels for display (e.g. badges, profile):

| Rating | Label |
|--------|-------|
| null (no contests) | Unrated |
| 0 - 1199 | Newbie |
| 1200 - 1399 | Pupil |
| 1400 - 1599 | Specialist |
| 1600 - 1899 | Expert |
| 1900 - 2099 | Candidate Master |
| 2100 - 2299 | Master |
| 2300 - 2399 | International Master |
| 2400 - 2599 | Grandmaster |
| 2600 - 2999 | International Grandmaster |
| 3000+ | Legendary Grandmaster |

The `rating_label` field in `GET /users` and user profile responses uses this mapping.
