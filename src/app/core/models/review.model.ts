export interface Review {
  id: string;
  job_id: string;
  reviewer_id: string;
  target_id: string;
  rating: number;
  comment?: string;
}

export interface CreateReviewPayload {
  target_id: string;
  rating: number;
  comment?: string;
}

