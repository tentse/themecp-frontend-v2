// Auth
export interface AuthResponse {
  token: string;
}

// Users
export interface UserResponse {
  id: string;
  email: string;
  codeforces_handle: string | null;
  rating: number | null;
  max_contest_rating: number | null;
  best_performance: number | null;
  contest_attempts: number;
  rating_label: string;
}

export interface CodeforcesProblem {
  contestID: string;
  index: string;
  rating: number;
  tags: string[];
}

// Contest Level
export interface ContestLevel {
  id: number;
  level: number;
  duration_in_min: number;
  performance: number;
  p1_rating: number;
  p2_rating: number;
  p3_rating: number;
  p4_rating: number;
}

// Contest Session (v2)
export type ContestStatus = 'REVIEW' | 'RUNNING' | 'FINISHED';
export type ProblemStatus = 'UNSOLVED' | 'SOLVED' | 'UPSOLVED';

/** Normalized: always use contestId. Backend may send contestID or contestId. */
export interface ProblemDetail {
  contestId: string;
  index: string;
  rating: number;
}

export interface ContestSessionInput {
  level: number;
  theme: string;
}

export interface ContestSessionOutput {
  id: string;
  status: ContestStatus;
  duration_in_min: number;
  user_id: string;
  starts_at: number | null;
  ends_at: number | null;
  level: number;
  theme: string;
  p1: ProblemDetail;
  p2: ProblemDetail;
  p3: ProblemDetail;
  p4: ProblemDetail;
}

export interface ContestSessionProblemsStatus {
  contest_session_id: string;
  starts_at: number;
  ends_at: number;
  p1: ProblemDetail;
  p2: ProblemDetail;
  p3: ProblemDetail;
  p4: ProblemDetail;
  p1_status: ProblemStatus;
  p2_status: ProblemStatus;
  p3_status: ProblemStatus;
  p4_status: ProblemStatus;
}

// Contest History (v2)
export interface ContestHistoryItem {
  session_id: string;
  date: string;
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
}

export interface ContestHistoryOutput {
  items: ContestHistoryItem[];
  skip: number;
  limit: number;
  total: number;
}

// Legacy alias
export type ContestSession = ContestSessionOutput;

// Error
export interface ApiError {
  detail: string;
  status: number;
}
