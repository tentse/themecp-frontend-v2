// Auth
export interface AuthResponse {
  token: string;
}

// Users
export interface UserResponse {
  id: string;
  email: string;
  codeforces_handle: string | null;
  last_contest_rating: number | null;
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

// Contest Session
export interface ProblemDetail {
  contestID: string;
  index: string;
  rating: number;
}

export type ContestSessionStatus = 'REVIEW' | 'RUNNING' | 'FINISHED';

export interface ContestSession {
  id: string;
  user_id: string;
  level: number;
  theme: string;
  duration_in_min: number;
  status: ContestSessionStatus;
  p1: ProblemDetail;
  p2: ProblemDetail;
  p3: ProblemDetail;
  p4: ProblemDetail;
}

export interface CreateContestSessionRequest {
  level: number;
  theme: string;
  duration_in_min: number;
}

export interface StartContestResponse {
  session_id: string;
  status: 'RUNNING';
  starts_at: number; // Unix timestamp seconds
  duration_in_min: number;
}

export interface RefreshProblemStatus {
  problem_number: number;
  state: 'UNSOLVED' | 'SOLVED';
  accepted_at: string | null;
  solved_in_min: number | null;
}

export interface EndContestResponse {
  session_id: string;
  status: 'FINISHED';
  solved_count: number;
  performance: number;
  rating_before: number;
  rating_after: number;
  rating_delta: number;
}

// Contest History
export interface ContestHistoryItem {
  date: string;
  level: number;
  theme: string;
  duration_in_min: number;
  solved_count: number;
  performance: number;
  rating_after: number;
  rating_delta: number;
  p1: ProblemDetail;
  p2: ProblemDetail;
  p3: ProblemDetail;
  p4: ProblemDetail;
}

export interface ContestHistoryResponse {
  items: ContestHistoryItem[];
  skip: number;
  limit: number;
  total: number;
}

// Error
export interface ApiError {
  detail: string;
}
