export interface ApiMessageResponse {
  message: string;
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  suggested_username?: string;
  [key: string]: unknown;
}

export interface IdResponse {
  job_id?: string;
  proposal_id?: string;
  review_id?: string;
  id?: string;
  message?: string;
}

