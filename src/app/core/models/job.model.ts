import { JobStatus } from '../config/api.config';
import { UserSummary } from './user.model';

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: JobStatus;
  owner_id: string;
  freelancer_id: string | null;
}

export interface JobDetail extends Job {
  owner: UserSummary;
  freelancer: UserSummary | null;
}

export interface JobSearchFilters {
  category?: string;
  status?: JobStatus;
  min_budget?: number | string | null;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  budget: number;
  category: string;
}

export interface UpdateJobPayload {
  title?: string;
  description?: string;
  budget?: number;
  category?: string;
  status?: JobStatus;
}
